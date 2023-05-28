import { z } from "zod";

export const CommentSchema = z.object({
  comments: z.array(
    z.object({
      user: z.object({
        name: z.string().nullable(),
      }),
      response: z.string().nullable(),
    })
  ),
});

export const createCommentSchema = z.object({
  postID: z.string(),
  comment: z.string().min(1).max(5000),
});

export const commentComponentSchema = z.object({
  postID: z.string(),
  comment: z.string().min(1).max(5000).optional(),
});

export type CommentProps = z.infer<typeof CommentSchema>;
export type CreateCommentProps = z.infer<typeof createCommentSchema>;
export type CommentComponentProps = z.infer<typeof commentComponentSchema>;
