import { api } from "@/utils/api";
import { Fragment } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { type TimelineOptions } from "@/src/types/timelineOptions";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import Content from "./Content";

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
          {data.pages.map((page, currentPage) => (
            <Fragment key={`page_${currentPage}`}>
              {page.postContentWithCommentsAndState.map((post, currentPost) => {
                return (
                  <div
                    key={post.id}
                    ref={
                      // if user is on the last queried page and second to last post, query more posts
                      currentPage === data.pages.length - 1 &&
                      currentPost ===
                        page.postContentWithCommentsAndState.length - 3
                        ? lastElementRef
                        : null
                    }
                    className="max-w-[w-full]"
                  >
                    <Content {...post} />
                  </div>
                );
              })}
            </Fragment>
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
