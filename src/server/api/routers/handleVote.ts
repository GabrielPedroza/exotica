import {
  handleCommentVoteSchema,
  handlePostVoteSchema,
} from "@/src/types/handleVote";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const handleVote = createTRPCRouter({
  mutatePostVote: protectedProcedure
    .input(handlePostVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { postID, typeOfVote } = input;

      const userID = session.user.id;

      const vote = await prisma.postVote.findUnique({
        where: {
          userID_postID: {
            userID,
            postID,
          },
        },
      });

      if (vote && vote.typeOfVote === typeOfVote) {
        await prisma.postVote.delete({
          where: {
            userID_postID: {
              userID,
              postID,
            },
          },
        });
      } else if (vote) {
        // If the user has already voted with the opposite typeOfVote, update their typeOfVote
        await prisma.postVote.update({
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
        await prisma.postVote.create({
          data: { postID, userID, typeOfVote },
        });
      }
    }),
});
