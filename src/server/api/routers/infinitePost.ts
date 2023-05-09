import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { timelineOptions } from "@/src/types/timelineOptions";
// import { BlockPost } from "@prisma/client";

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
      // const voteCount = api.handleVote.voteCount.useQuery();

      const items = await ctx.prisma.blockPost.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: filters,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: sort },
        include: {
          author: true,
          _count: {
            select: {
              votes: {
                where: {
                  typeOfVote: "up", // only count upvotes, bc prisma
                },
              },
            },
          },
          votes: {
            // get the vote type of the current user
            where: {
              userID: ctx.session?.user?.id,
            },
            select: {
              typeOfVote: true,
            },
          },
        },
      });

      //       type BlockPostWithUpvotesAndAuthor = BlockPost & {
      //         upvotes: number;
      //         downvotes: number;
      //         author: {
      //           name: string | null;
      //           image: string | null;
      //         };
      //         myVote: {
      //           id: string;
      //           typeOfVote: string;
      //         };
      //       };

      //       const items = await ctx.prisma.$queryRaw<BlockPostWithUpvotesAndAuthor[]>`
      //   SELECT
      //       p.*,
      //       COUNT(CASE WHEN v.typeOfVote = 'up' THEN 1 END) as upvotes,
      //       COUNT(CASE WHEN v.typeOfVote = 'down' THEN 1 END) as downvotes,
      //       (SELECT JSON_OBJECT('id', v.id, 'typeOfVote', v.typeOfVote) FROM Vote AS v WHERE v.postID = p.id AND v.userID = ${
      //         ctx.session?.user?.id
      //       }) AS myVote,
      //       json_object('name', a.name, 'image', a.image) as author

      //   FROM
      //       BlockPost p
      //       LEFT JOIN Vote v ON v.postID = p.id
      //       left join User as a on a.id = p.authorID
      //   WHERE p.authorID != ${ctx.session?.user?.id}
      //   GROUP BY
      //       p.id
      //   ORDER BY
      //       p.createdAt ASC
      //   LIMIT ${limit + 1}
      // `;

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      return {
        items,
        nextCursor,
      };
    }),
});
