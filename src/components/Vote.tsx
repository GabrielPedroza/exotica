import { api } from "@/utils/api";
import type { VoteType } from "../types/voteType";
import { useState } from "react";

const Vote = ({ postID, voteCount, myCurrentVote }: VoteType) => {
  const mutateVote = api.handleVote.mutateVote.useMutation();

  // Check if the vote count data is available
  const [myCurrentVoteState, setMyCurrentVoteState] = useState(myCurrentVote);
  const [voteCountState, setVoteCount] = useState(voteCount);

  const handleVote = async (typeOfVote: string) => {
    if (myCurrentVoteState?.typeOfVote === "up") {
      setVoteCount(voteCountState - 1);
    } else if (typeOfVote === "up") {
      setVoteCount(voteCountState + 1);
    }

    if (myCurrentVoteState?.typeOfVote === typeOfVote) {
      setMyCurrentVoteState(null);
    } else if (!myCurrentVoteState) {
      setMyCurrentVoteState({ typeOfVote });
    } else {
      setMyCurrentVoteState((prev) => ({ ...prev, typeOfVote }));
    }

    // Prevent the user from voting again if the vote is loading (i.e. the vote is being sent to the server)
    if (mutateVote.isLoading) return;

    try {
      await mutateVote.mutateAsync({
        postID,
        typeOfVote,
      });
    } catch (error) {
      // Show some UI error
      console.log(error);
    }
  };

  return (
    <div>
      <VoteButton
        type="up"
        myCurrentVote={myCurrentVoteState}
        handleVote={(e) => void handleVote(e)}
      />
      <p>upvote: {voteCountState}</p>
      <br />
      <p>downvote</p>
      <br />
      <VoteButton
        type="down"
        myCurrentVote={myCurrentVoteState}
        handleVote={(e) => void handleVote(e)}
      />
    </div>
  );
};

const VoteButton = ({
  type,
  myCurrentVote,
  handleVote,
}: {
  type: string;
  myCurrentVote: { typeOfVote: string } | null;
  handleVote: (typeOfVote: string) => void;
}) => (
  <button
    className={
      myCurrentVote?.typeOfVote === type ? "bg-zinc-700" : "text-black"
    }
    onClick={() => handleVote(type)}
  >
    {type === "up" ? "^" : "v"}
  </button>
);

export default Vote;
