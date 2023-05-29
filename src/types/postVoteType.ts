import { z } from "zod";

const postVoteProps = z.object({
  postID: z.string(),
  voteCount: z.number(),
  myCurrentVote: z.enum(["up", "down"]).nullable(),
});

export type PostVoteType = z.infer<typeof postVoteProps>;
