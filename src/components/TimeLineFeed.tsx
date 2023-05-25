import { api } from "@/utils/api";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { type TimelineOptions } from "@/src/types/timelineOptions";
import CreatedByUser from "./CreatedByUser";
import PostContent from "./PostContent";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import Vote from "./Vote";
import Comments from "./Comment";

const TimeLineFeed = (props: { options: TimelineOptions }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.infinitePost.infinitePost.useInfiniteQuery(
      { options: props.options },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const lastElementRef = useIntersectionObserver(() => {
    void fetchNextPage();
  });

  return (
    <div className="rounded-l-md bg-slate-600 text-center">
      {data ? (
        <>
          {data.pages.map((page, i) => (
            <React.Fragment key={`page_${i}`}>
              {page.itemsWithTotalVotesAndVoteState.map((post, j) => (
                <div
                  key={post.id}
                  ref={
                    i === data.pages.length - 1 &&
                    j === page.itemsWithTotalVotesAndVoteState.length - 3
                      ? lastElementRef
                      : null
                  }
                  className="max-w-[w-full]"
                >
                  <PostContent content={post} />
                  <Vote
                    postID={post.id}
                    voteCount={
                      post._count.votes - (post.totalVotes - post._count.votes)
                    }
                    myCurrentVote={post.currentUserVoteState}
                  />
                  <Comments />
                  <p>Post made by:</p>
                  <CreatedByUser
                    userInfo={{
                      author: {
                        name: post.author.name,
                        image: post.author.image,
                      },
                      authorID: post.authorID,
                    }}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </>
      ) : (
        <LoadingSpinner />
      )}
      {isFetchingNextPage ? (
        <LoadingSpinner />
      ) : !hasNextPage && data && data.pages.length > 1 ? (
        <p className="text-white">No more posts. Come back tomorrow!</p>
      ) : null}
    </div>
  );
};

export default TimeLineFeed;
