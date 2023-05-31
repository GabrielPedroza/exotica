import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

const handlePostVoteSchema = z.object({
  postID: z.string(),
  typeOfVote: z.enum(["up", "down"]),
});

const handleCommentVoteSchema = z.object({
  commentID: z.string(),
  typeOfVote: z.enum(["up", "down"]),
});

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

  mutateCommentVote: protectedProcedure
    .input(handleCommentVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { commentID, typeOfVote } = input;

      const userID = session.user.id;

      const vote = await prisma.commentVote.findUnique({
        where: {
          userID_commentID: {
            userID,
            commentID,
          },
        },
      });

      if (vote && vote.typeOfVote === typeOfVote) {
        await prisma.commentVote.delete({
          where: {
            userID_commentID: {
              userID,
              commentID,
            },
          },
        });
      } else if (vote) {
        // If the user has already voted with the opposite typeOfVote, update their typeOfVote
        await prisma.commentVote.update({
          where: {
            userID_commentID: {
              userID,
              commentID,
            },
          },
          data: { typeOfVote },
        });
      } else {
        // If the user has not already voted, add their vote to the Votes table
        await prisma.commentVote.create({
          data: { commentID, userID, typeOfVote },
        });
      }
    }),
});
