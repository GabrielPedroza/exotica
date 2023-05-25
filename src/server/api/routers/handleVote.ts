import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

const handleVoteSchema = z.object({
  postID: z.string(),
  typeOfVote: z.string(),
});

export const handleVote = createTRPCRouter({
  mutateVote: protectedProcedure
    .input(handleVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { postID, typeOfVote } = input;

      const userID = session.user.id;

      const vote = await prisma.vote.findUnique({
        where: {
          userID_postID: {
            userID,
            postID,
          },
        },
      });

      if (vote && vote.typeOfVote === typeOfVote) {
        await prisma.vote.delete({
          where: {
            userID_postID: {
              userID,
              postID,
            },
          },
        });
      } else if (vote) {
        // If the user has already voted with the opposite typeOfVote, update their typeOfVote
        await prisma.vote.update({
          where: {
            userID_postID: {
              userID,
              postID,
            },
          },
          data: { typeOfVote },
        });
      } else {
        // If the user has not already voted, add their vote to the Votes table
        await prisma.vote.create({
          data: { postID, userID, typeOfVote },
        });
      }
    }),
});
