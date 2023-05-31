import type { FirstCommentType } from "./commentType";

export type PostVoteType = {
  postID: string;
  voteCount: number;
  myCurrentVote: CurrentVoteType;
};

export type CurrentVoteState = (
  typeOfVote: VoteType,
  currentVote: CurrentVoteType,
  setterFunction: React.Dispatch<React.SetStateAction<number>>,
  setterCurrentVoteState: React.Dispatch<React.SetStateAction<CurrentVoteType>>
) => void;

export type CurrentVoteStateComment = (
  typeOfVote: VoteType,
  comment: FirstCommentType
) => FirstCommentType;

export type VoteType = "up" | "down";
export type CurrentVoteType = VoteType | null;