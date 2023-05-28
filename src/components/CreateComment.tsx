import { useState } from "react";
import {
  createCommentSchema,
  type CommentComponentProps,
} from "../types/commentType";
import { api } from "../utils/api";

const CreateComment = ({ postID }: CommentComponentProps) => {
  const [comment, setComment] = useState("");
  const createComment = api.comment.createComment.useMutation();
  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    console.log({ postID, comment });
    e.preventDefault();
    try {
      createCommentSchema.parse({ postID, comment });
    } catch (e) {
      return;
    }

    createComment.mutate({ postID, comment });
    setComment("");
  };

  const handleUserCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="comment"
          onChange={(e) => handleUserCommentChange(e)}
          value={comment}
        />
        <button>submit</button>
      </form>
    </div>
  );
};

export default CreateComment;
