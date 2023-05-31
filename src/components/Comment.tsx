import { memo, useState } from "react";
import { type CommentProps, CommentSchema } from "../types/commentType";
import { api } from "../utils/api";
import { currentVoteStateComment } from "../utils/currentVoteState";

type HandleCommentVote = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  id: string,
  typeOfVote: "up" | "down"
) => void;

const Comment = memo((comments: CommentProps) => {
  const mutateComment = api.handleVote.mutateCommentVote.useMutation();
  const [parsedComments, setParsedComments] = useState(
    CommentSchema.parse(comments)
  );

  if (!parsedComments.comments) return null;

  const handleVote: HandleCommentVote = (event, id, typeOfVote) => {
    event.stopPropagation(); // Prevent event bubbling
    if (!mutateComment.isLoading) {
      try {
        mutateComment.mutate({ commentID: id, typeOfVote });
        if (!parsedComments.comments) return null;

        const updatedComments = parsedComments.comments.map((comment) => {
          if (comment.id === id)
            return currentVoteStateComment(typeOfVote, comment);
          return comment;
        });

        // Update the state variable with the updated comments
        setParsedComments({ ...parsedComments, comments: updatedComments });
      } catch (error) {
        console.error(error);
      }
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
