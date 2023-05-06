import { api } from "@/utils/api";
import { z } from "zod";

export const handleVoteSchema = z.object({
  postID: z.string(),
  typeOfVote: z.string(),
});

export const handleHasUpVotedSchema = z.object({
  postID: z.string(),
  userID: z.string().optional(),
});

type VoteProps = {
  postID: string;
};

const Vote = ({ postID }: VoteProps) => {
  const mutateVote = api.handleVote.mutateVote.useMutation();
  const { data: voteCountData } = api.handleVote.voteCount.useQuery({ postID });

  // Check if the vote count data is available
  const { upvoteCount = 0, downvoteCount = 0 } = voteCountData ?? {};

  const handleVote = async (typeOfVote: string) => {
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

  // Check if the vote count data is available
  if (voteCountData === undefined) {
    return <p>Loading vote counts...</p>;
  }

  return (
    <div>
      <button onClick={() => void handleVote("up")}>^</button>
      <p>upvote: {upvoteCount}</p>
      <br />
      <p>downvote: {downvoteCount}</p>
      <br />
      <button onClick={() => void handleVote("down")}>v</button>
    </div>
  );
};

export default Vote;