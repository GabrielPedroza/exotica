import { z } from "zod";

export const handlePostVoteSchema = z.object({
  postID: z.string(),
  typeOfVote: z.enum(["up", "down"]),
});

export const handleCommentVoteSchema = z.object({
  commentID: z.string(),
  typeOfVote: z.enum(["up", "down"]),
});
