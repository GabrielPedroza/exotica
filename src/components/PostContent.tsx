import MarkdownTextarea from "./MarkdownTextarea";
import type { InfiniteQueryOutput } from "../types/InfiniteQueryOutput";

const PostContent = (postContent: { content: InfiniteQueryOutput }) => {
  const { leftBlock, rightBlock, text } = postContent.content;

  return (
    <>
      <p className="mx-auto mb-7 max-w-[60ch] break-words text-white">{text}</p>
      <div className="m-4 flex justify-evenly break-words">
        <div onClick={() => void navigator.clipboard.writeText(leftBlock)}>
          <p className="cursor-pointer">click to copy</p>
          <MarkdownTextarea className="max-w-[45vw]">
            {leftBlock}
          </MarkdownTextarea>
        </div>
        {rightBlock && (
          <div onClick={() => void navigator.clipboard.writeText(rightBlock)}>
            <div className="cursor-pointer">click to copy</div>
            <MarkdownTextarea className="max-w-[45vw]">
              {rightBlock}
            </MarkdownTextarea>
          </div>
        )}
      </div>
    </>
  );
};

export default PostContent;
