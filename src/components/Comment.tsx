import { memo } from "react";
import { type CommentProps, CommentSchema } from "../types/commentType";
import { api } from "../utils/api";

type HandleCommentVote = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  id: string,
  typeOfVote: "up" | "down"
) => void;

const Comment = memo((comments: CommentProps) => {
  const parsedComments = CommentSchema.parse(comments);
  const mutateComment = api.handleVote.mutateCommentVote.useMutation();

  if (!parsedComments.comments) return null;

  console.log(parsedComments.comments);

  const handleVote: HandleCommentVote = (event, id, typeOfVote) => {
    // if (!mutateComment.isLoading) return null;
    console.log(event, typeOfVote, id);

    try {
      mutateComment.mutate({ commentID: id, typeOfVote });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {parsedComments.comments.length
        ? parsedComments.comments.map((comment, i) => (
            <div key={`comment_${i}`}>
              <span className="text-red-600">
                {comment.upvotes - comment.downvotes}{" "}
              </span>
              <div
                className="cursor-pointer"
                onClick={(e) => handleVote(e, comment.id, "up")}
              >
                upvote
              </div>
              <br />
              <div
                className="cursor-pointer"
                onClick={(e) => handleVote(e, comment.id, "down")}
              >
                downvote
              </div>
              <br />
              <span>{comment.user.name}</span>
              <p>{comment.response}</p>
            </div>
          ))
        : "no comments yet"}
    </div>
  );
});

Comment.displayName = "Comment";
export default Comment;
