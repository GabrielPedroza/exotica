import { z } from "zod";

const voteProps = z.object({
  postID: z.string(),
  voteCount: z.number(),
  myCurrentVote: z.string().nullable(),
});

export type VoteType = z.infer<typeof voteProps>;
