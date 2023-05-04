import { createTRPCRouter } from "./trpc";
import { post } from "./routers/post";
import { infinitePost } from "./routers/infinitePost";
import { handleVote } from "./routers/handleVote";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  post,
  infinitePost,
  handleVote,
});

// export type definition of API
export type AppRouter = typeof appRouter;
