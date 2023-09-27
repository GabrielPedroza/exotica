import type { InfiniteQueryOutput } from "../types/InfiniteQueryOutput";
import Comment from "./Comment";
import CreateComment from "./CreateComment";
import CreatedByUser from "./CreatedByUser";
import PostContent from "./PostContent";
import PostVote from "./PostVote";

const Content = (content: InfiniteQueryOutput) => {
  return (
    <>
      <div>
        <PostContent content={content} />
        <PostVote
          postID={content.id}
          voteCount={
            content._count.postVotes -
            (content.totalVotes - content._count.postVotes)
          }
          myCurrentVote={content.currentUserVoteState as "up" | "down"}
        />
        <div>
          <CreateComment postID={content.id} />
          <Comment comments={content.comments ?? []} />
        </div>
      </div>
      <p>Post made by: </p>
      <CreatedByUser
        userInfo={{
          author: {
            name: content.author.name,
            image: content.author.image,
          },
          authorID: content.authorID,
        }}
      />
    </>
  );
};

export default Content;
