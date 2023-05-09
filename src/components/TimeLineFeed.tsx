import { api } from "@/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import {
  timelineOptions,
  type TimelineOptions,
} from "@/src/types/timelineOptions";
import CreatedByUser from "./CreatedByUser";
import PostContent from "./PostContent";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import Vote from "./Vote";

const TimeLineFeed = (props: { options: TimelineOptions }) => {
  const parsedResult = timelineOptions.parse(props.options);
  const options = parsedResult;

  const lastElementRef = useIntersectionObserver(() => {
    // function will be called when the last element is in view
    void fetchNextPage();
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.infinitePost.infinitePost.useInfiniteQuery(
      { options },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <div className="rounded-l-md bg-slate-600 text-center">
      {data ? (
        data?.pages.map((page, i) =>
          page.items.map((post, j) => (
            <div
              key={post.id}
              ref={
                i == data.pages.length - 1 && j == page.items.length - 3
                  ? lastElementRef
                  : null
              }
              className="max-w-[w-full]"
            >
              <PostContent content={post} />
              <Vote
                postID={post.id}
                voteCount={post._count.votes}
                myCurrentVote={post.votes[0] || null}
              />
              <p>Post made by:</p>
              <CreatedByUser
                userInfo={{
                  author: { name: post.author.name, image: post.author.image },
                  authorID: post.authorID,
                }}
              />
            </div>
          ))
        )
      ) : (
        <LoadingSpinner />
      )}
      {isFetchingNextPage ? (
        <LoadingSpinner />
      ) : !hasNextPage && data && data?.pages.length > 1 ? (
        <p className="text-white">No more posts. Come back tomorrow!</p>
      ) : null}
    </div>
  );
};

export default TimeLineFeed;
