import { createCommentSchema } from "@/src/types/commentType";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const comment = createTRPCRouter({
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { comment: response, postID } = input;
      const userID = session.user.id;
      console.log(response, postID, userID);

      return prisma.comment.create({
        data: {
          response,
          user: {
            connect: {
              id: userID,
            },
          },
          post: {
            connect: {
              id: postID,
            },
          },
        },
      });
    }),
});
