import { api } from "@/utils/api";
import type { PostVoteType } from "../types/postVoteType";
import { memo, useState } from "react";

type VoteType = "up" | "down";
type CurrentVoteType = VoteType | null;

const PostVote = memo(({ postID, voteCount, myCurrentVote }: PostVoteType) => {
  const mutateVote = api.handleVote.mutatePostVote.useMutation();

  const [myCurrentVoteState, setMyCurrentVoteState] = useState(myCurrentVote);
  const [voteCountState, setVoteCount] = useState(voteCount);

  const handleVote = async (typeOfVote: VoteType) => {
    if (!mutateVote.isLoading) {
      if (!myCurrentVoteState) {
        if (typeOfVote === "up") {
          setVoteCount((prev) => prev + 1);
        }
        if (typeOfVote === "down") {
          setVoteCount((prev) => prev - 1);
        }
      } else {
        if (myCurrentVoteState === "up" && typeOfVote === "up") {
          setVoteCount((prev) => prev - 1);
        }
        if (myCurrentVoteState === "down" && typeOfVote === "down") {
          setVoteCount((prev) => prev + 1);
        }
        if (myCurrentVoteState === "up" && typeOfVote === "down") {
          setVoteCount((prev) => prev - 2);
        }
        if (myCurrentVoteState === "down" && typeOfVote === "up") {
          setVoteCount((prev) => prev + 2);
        }
      }

      if (myCurrentVoteState === typeOfVote) {
        setMyCurrentVoteState(null);
      } else if (!myCurrentVoteState) {
        setMyCurrentVoteState(typeOfVote);
      } else {
        setMyCurrentVoteState(typeOfVote);
      }
    }

    try {
      await mutateVote.mutateAsync({
        postID,
        typeOfVote,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <VoteButton
        type="up"
        myCurrentVote={myCurrentVoteState}
        handleVote={(e) => void handleVote(e)}
      />
      <p className="text-lg font-semibold">{voteCountState}</p>
      <VoteButton
        type="down"
        myCurrentVote={myCurrentVoteState}
        handleVote={(e) => void handleVote(e)}
      />
    </div>
  );
});

PostVote.displayName = "Vote";

type VoteButtonProps = {
  type: VoteType;
  myCurrentVote: CurrentVoteType;
  handleVote: (typeOfVote: VoteType) => void;
};

const VoteButton = ({ type, myCurrentVote, handleVote }: VoteButtonProps) => (
  <button
    className={`flex h-10 w-10 items-center justify-center rounded-full focus:outline-none ${
      myCurrentVote === type
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    }`}
    onClick={() => handleVote(type)}
  >
    {type === "up" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )}
  </button>
);

export default PostVote;
