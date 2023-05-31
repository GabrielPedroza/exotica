import type {
  CurrentVoteState,
  CurrentVoteStateComment,
} from "../types/interactionTypes";

export const currentVoteState: CurrentVoteState = (
  typeOfVote,
  currentVote,
  setterFunction,
  setterCurrentVoteState
) => {
  if (!currentVote) {
    if (typeOfVote === "up") {
      setterFunction((prev) => prev + 1);
    }

    if (typeOfVote === "down") {
      setterFunction((prev) => prev - 1);
    }
  } else {
    if (currentVote === typeOfVote && typeOfVote === "up") {
      setterFunction((prev) => prev - 1);
    }

    if (currentVote === typeOfVote && typeOfVote === "down") {
      setterFunction((prev) => prev + 1);
    }

    if (currentVote === "up" && typeOfVote === "down") {
      setterFunction((prev) => prev - 2);
    }

    if (currentVote === "down" && typeOfVote === "up") {
      setterFunction((prev) => prev + 2);
    }
  }

  if (currentVote === typeOfVote) {
    setterCurrentVoteState(null);
  } else if (!currentVote) {
    setterCurrentVoteState(typeOfVote);
  } else {
    setterCurrentVoteState(typeOfVote);
  }
};

export const currentVoteStateComment: CurrentVoteStateComment = (
  typeOfVote,
  comment
) => {
  if (!comment.currentUserVoteState) {
    if (typeOfVote === "up") {
      return {
        ...comment,
        upvotes: comment.upvotes + 1,
        currentUserVoteState: "up",
      };
    }

    if (typeOfVote === "down") {
      return {
        ...comment,
        upvotes: comment.upvotes - 1,
        currentUserVoteState: "down",
      };
    }
  } else {
    if (comment.currentUserVoteState === typeOfVote && typeOfVote === "up") {
      return {
        ...comment,
        upvotes: comment.upvotes - 1,
        currentUserVoteState: null,
      };
    }

    if (comment.currentUserVoteState === typeOfVote && typeOfVote === "down") {
      return {
        ...comment,
        downvotes: comment.downvotes - 1,
        currentUserVoteState: null,
      };
    }

    if (comment.currentUserVoteState === "up" && typeOfVote === "down") {
      return {
        ...comment,
        upvotes: comment.upvotes - 1,
        downvotes: comment.downvotes + 1,
        currentUserVoteState: "down",
      };
    }

    if (comment.currentUserVoteState === "down" && typeOfVote === "up") {
      return {
        ...comment,
        upvotes: comment.upvotes + 1,
        downvotes: comment.downvotes - 1,
        currentUserVoteState: "up",
      };
    }
  }
  return comment;
};
