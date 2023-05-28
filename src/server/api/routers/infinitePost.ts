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

      const items = await ctx.prisma.blockPost.findMany({
        take: limit + 1,
        where: filters,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: sort },
        include: {
          author: true,
          _count: {
            select: {
              votes: {
                where: {
                  typeOfVote: "up",
                },
              },
            },
          },
          votes: {
            select: {
              typeOfVote: true,
            },
          },
          comments: {
            select: {
              response: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const postIdList = items.map((item) => item.id);
      const voteState = await ctx.prisma.vote.findMany({
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
        const totalVotes = item.votes.length;
        const currentUserVoteState = voteStateByPostId[item.id] || null;
        return {
          ...item,
          totalVotes: totalVotes,
          currentUserVoteState: currentUserVoteState,
        };
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      return {
        itemsWithTotalVotesAndVoteState,
        nextCursor,
      };
    }),
});
