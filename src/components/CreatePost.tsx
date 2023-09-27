import { useState, useRef } from "react";
import { z } from "zod";
import { api } from "@/utils/api";
import Editor, { type EditorProps } from "@monaco-editor/react";
import LoadingSpinner from "./LoadingSpinner";
import Confetti from "./Confetti";

// requirements for the post:
export const codeSchema = z.object({
  description: z
    .string({
      required_error: "Code is required",
    })
    .min(10)
    .max(280),
  editorBoxOne: z
    .string({
      required_error: "Code is required",
    })
    .min(1),
  editorBoxTwo: z.string().optional(),
});

type IEditorProps = EditorProps & {
  getValue: () => string | undefined;
};

const CreatePost = () => {
  const defaultCode = "// write your code here";
  const secondBlockOptionalCode = ". (this code block is optional)";
  const [description, setDescription] = useState("");
  const validDescriptionLength =
    description.length <= 280 && description.length >= 10;
  const lengthOfDescription = description.length;
  const [editorOneValue, setEditorOneValue] = useState(defaultCode);
  const [editorTwoValue, setEditorTwoValue] = useState(
    defaultCode + secondBlockOptionalCode
  );
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const editorRefOne = useRef<undefined | string>(undefined);
  const editorRefTwo = useRef<undefined | string>(undefined);

  const createPost = api.post.createPost.useMutation();

  const handleEditorOneDidMount = (editor: IEditorProps) => {
    editorRefOne.current = editor.getValue();
  };

  const handleEditorTwoDidMount = (editor: IEditorProps) => {
    editorRefTwo.current = editor.getValue();
  };

  const handleEditorOneWillUpdate = (editor: string | undefined) => {
    editorRefOne.current = editor;
    setEditorOneValue(editor as string);
  };

  const handleEditorTwoWillUpdate = (editor: string | undefined) => {
    editorRefTwo.current = editor;
    setEditorTwoValue(editor as string);
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    // editors will be mounted before the submit button is clicked
    const editorBoxOne = editorRefOne.current as string;
    const editorBoxTwo = editorRefTwo.current as string;

    try {
      codeSchema.parse({ description, editorBoxOne, editorBoxTwo });
    } catch (e) {
      return;
    }

    if (editorRefTwo.current === defaultCode + secondBlockOptionalCode) {
      createPost.mutate({ description, editorBoxOne });
    } else {
      createPost.mutate({ description, editorBoxOne, editorBoxTwo });
    }

    if (createPost.isError) console.error(createPost.error);

    void Confetti();

    setDescription("");
    setEditorOneValue(defaultCode);
    setEditorTwoValue(defaultCode + secondBlockOptionalCode);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const descriptionStateOnBlur = () => {
    if (validDescriptionLength) {
      setDescriptionFocused(false);
    }
  };

  return (
    <>
      {createPost.error && (
        // <p className="text-red-500">{createPost.error.message}</p>
        <p>Oops! There was an error! Refresh and try again.</p>
      )}
      <div className="m-4 mb-12">
        <form onSubmit={handleSubmit}>
          <textarea
            rows={3}
            placeholder="Enter the description here..."
            className={`mt-4 h-[6rem] w-[41vw] resize-none rounded-md outline-none ${
              descriptionFocused ? "border-4" : ""
            } ${
              validDescriptionLength ? "border-green-300" : "border-red-500"
            }`}
            value={description}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={descriptionStateOnBlur}
            // onChange has descriptionFocused func instead of setDescription because onChange needs to call two functions
            onChange={(e) => handleDescriptionChange(e)}
          />
          <p
            className={`${
              validDescriptionLength ? "text-green-300" : "text-red-500"
            }`}
          >
            {lengthOfDescription}
          </p>
          <div className="mt-6 flex justify-center gap-5">
            <Editor
              height="35vh"
              width="35vw"
              onMount={handleEditorOneDidMount}
              onChange={handleEditorOneWillUpdate}
              defaultLanguage="javascript"
              value={editorOneValue}
              loading={<LoadingSpinner />}
            />
            <Editor
              height="35vh"
              width="35vw"
              onChange={handleEditorTwoWillUpdate}
              defaultLanguage="javascript"
              onMount={handleEditorTwoDidMount}
              value={editorTwoValue}
              loading={<LoadingSpinner />}
            />
          </div>
          <br />
          <button
            type="submit"
            className="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default CreatePost;
