import { codeSchema } from "@/src/components/CreatePost";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const post = createTRPCRouter({
  createPost: protectedProcedure
    .input(codeSchema)
    .mutation(({ ctx, input }) => {
      const { description: text, editorBoxOne, editorBoxTwo } = input;
      const { prisma, session } = ctx;
      const userID = session.user.id;
      return prisma.blockPost.create({
        data: {
          text,
          leftBlock: editorBoxOne,
          rightBlock: editorBoxTwo,
          author: {
            connect: {
              id: userID,
            },
          },
        },
      });
    }),
});
