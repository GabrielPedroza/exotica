import { memo } from "react";
import { type CommentProps, CommentSchema } from "../types/commentType";

const Comment = memo((comments: CommentProps) => {
  const parsedComments = CommentSchema.parse(comments);
  return (
    <div>
      {parsedComments.comments.length
        ? parsedComments.comments.map((comment, i) => (
            <div key={`comment_${i}`}>
              <p>{comment.user.name}</p>
              <p>{comment.response}</p>
            </div>
          ))
        : "no comments yet"}
    </div>
  );
});

Comment.displayName = "Comment";
export default Comment;
