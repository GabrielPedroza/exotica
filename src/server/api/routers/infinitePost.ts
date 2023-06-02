import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  type TimelineOptionsFilters,
  type TimelineOptionsSort,
  timelineOptions,
} from "@/src/types/timelineOptions";
import type { Prisma, PrismaClient } from "@prisma/client";

export const infinitePost = createTRPCRouter({
  infinitePost: publicProcedure
    .input(
      z.object({
        options: timelineOptions,
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, options } = input;
      const { limit, sort, filters } = options;

      const postContentWithCommentsAndState =
        await fetchPostsWithVotesAndVoteState(
          ctx.session?.user?.id,
          ctx.prisma,
          cursor,
          limit,
          sort,
          filters
        );

      // Fetch comments in batch for all items
      const postsWithComments = await commentsFunc(
        ctx.session?.user?.id,
        ctx.prisma,
        postContentWithCommentsAndState
      );

      let nextCursor;
      if (postsWithComments.length > limit) {
        const nextItem = postsWithComments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        postContentWithCommentsAndState: postsWithComments,
        nextCursor,
      };
    }),
});

const fetchPostsWithVotesAndVoteState = async (
  sessionID: string | undefined,
  prisma: PrismaClient,
  cursor: string | null | undefined,
  limit: number,
  sort: TimelineOptionsSort,
  filters: TimelineOptionsFilters
) => {
  const postsWithVotesAndState = await prisma.$transaction(async (prisma) => {
    const posts = await prisma.blockPost.findMany({
      take: limit + 1,
      where: filters,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: sort },
      include: {
        author: true,
        _count: {
          select: {
            postVotes: {
              where: {
                typeOfVote: "up",
              },
            },
          },
        },
        postVotes: {
          select: {
            typeOfVote: true,
          },
        },
      },
    });

    const postIdList = posts.map((post) => post.id);

    const voteState = await prisma.postVote.findMany({
      where: {
        postID: {
          in: postIdList,
        },
        userID: sessionID,
      },
      select: {
        postID: true,
        typeOfVote: true,
      },
    });

    const voteStateByPostId: Record<string, string | null> = {};
    voteState.forEach((vote) => {
      voteStateByPostId[vote.postID] = vote.typeOfVote;
    });

    const postsWithVotesAndVoteState = posts.map((post) => {
      const totalVotes = post.postVotes.length;
      const currentUserVoteState =
        voteStateByPostId[post.id] || (null as "up" | "down" | null);
      return {
        ...post,
        totalVotes,
        currentUserVoteState,
      };
    });

    return postsWithVotesAndVoteState;
  });

  return postsWithVotesAndState;
};

type PostWithVotes = Prisma.PromiseReturnType<
  typeof fetchPostsWithVotesAndVoteState
>;

const commentsFunc = async (
  sessionID: string | undefined,
  prisma: PrismaClient,
  postContentWithCommentsAndState: PostWithVotes
) => {
  const commentPromises = postContentWithCommentsAndState.map(async (item) => {
    // Fetch comments
    const comments = await prisma.comment.findMany({
      take: 2,
      where: {
        postID: item.id,
      },
      select: {
        response: true,
        id: true,
        user: {
          select: {
            name: true,
          },
        },
        commentVotes: {
          select: {
            typeOfVote: true,
          },
        },
      },
    });

    const userCommentVoteState = await prisma.commentVote.findMany({
      where: {
        commentID: {
          in: comments.map((comment) => comment.id),
        },
        userID: sessionID,
      },
      select: {
        commentID: true,
        typeOfVote: true,
      },
    });

    const userCommentVoteStateByCommentId: Record<string, string | null> = {};

    userCommentVoteState.forEach((vote) => {
      userCommentVoteStateByCommentId[vote.commentID] = vote.typeOfVote;
    });

    // Compute upvotes and downvotes for each comment
    const computedComments = comments.map((comment) => {
      const upvotes = comment.commentVotes.filter(
        (vote) => vote.typeOfVote === "up"
      ).length;
      const downvotes = comment.commentVotes.filter(
        (vote) => vote.typeOfVote === "down"
      ).length;
      return {
        ...comment,
        currentUserVoteState: userCommentVoteStateByCommentId[comment.id],
        upvotes,
        downvotes,
      };
    });

    // Sort comments based on upvotes
    const sortedComments = computedComments.sort(
      (a, b) => b.upvotes - a.upvotes
    );

    // Return only the top 2 comments
    return sortedComments.slice(0, 2);
  });

  const commentsByPostId = await Promise.all(commentPromises);
  const itemsWithTotalVotesAndComments = postContentWithCommentsAndState.map(
    (item, index) => ({
      ...item,
      comments: commentsByPostId[index],
    })
  );

  return itemsWithTotalVotesAndComments;
};
