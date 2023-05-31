import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { timelineOptions } from "@/src/types/timelineOptions";

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

      const itemsWithTotalVotesAndVoteState = await ctx.prisma.$transaction(
        async (prisma) => {
          const items = await prisma.blockPost.findMany({
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

          const postIdList = items.map((item) => item.id);

          const voteState = await prisma.postVote.findMany({
            where: {
              postID: {
                in: postIdList,
              },
              userID: ctx.session?.user?.id,
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

          const itemsWithTotalVotesAndVoteState = items.map((item) => {
            const totalVotes = item.postVotes.length;
            const currentUserVoteState =
              voteStateByPostId[item.id] || (null as "up" | "down" | null);
            return {
              ...item,
              totalVotes: totalVotes,
              currentUserVoteState: currentUserVoteState,
            };
          });

          return itemsWithTotalVotesAndVoteState;
        }
      );

      // Fetch comments in batch for all items
      const commentPromises = itemsWithTotalVotesAndVoteState.map(
        async (item) => {
          // Fetch comments
          const comments = await ctx.prisma.comment.findMany({
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

          const userCommentVoteState = await ctx.prisma.commentVote.findMany({
            where: {
              commentID: {
                in: comments.map((comment) => comment.id),
              },
              userID: ctx.session?.user?.id,
            },
            select: {
              commentID: true,
              typeOfVote: true,
            },
          });

          const userCommentVoteStateByCommentId: Record<string, string | null> =
            {};

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
        }
      );

      const commentsByPostId = await Promise.all(commentPromises);
      const itemsWithTotalVotesAndComments =
        itemsWithTotalVotesAndVoteState.map((item, index) => ({
          ...item,
          comments: commentsByPostId[index],
        }));

      let nextCursor;
      if (itemsWithTotalVotesAndComments.length > limit) {
        const nextItem = itemsWithTotalVotesAndComments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        itemsWithTotalVotesAndVoteState: itemsWithTotalVotesAndComments,
        nextCursor,
      };
    }),
});
