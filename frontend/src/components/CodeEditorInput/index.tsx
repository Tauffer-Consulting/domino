import CodeEditor from "@uiw/react-textarea-code-editor";
import React from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";

interface Props {
  language?: string;
  placeholder?: string;
}

const CodeEditorItem = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ language = "python", placeholder, ...register }, ref) => (
    <CodeEditor
      language={language}
      placeholder={placeholder ?? ""}
      padding={15}
      style={{
        fontSize: 12,
        backgroundColor: "#f5f5f5",
        fontFamily:
          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        borderRadius: 4,
        border: "1px solid #ddd",
        width: "100%",
        minHeight: "200px",
        maxHeight: "400px",
        overflowY: "scroll",
      }}
      ref={ref}
      {...register}
    />
  ),
);

CodeEditorItem.displayName = "CodeEditorItem";

interface CodeEditorInputProps<T> {
  name: Path<T>;
  language?: string;
  placeholder?: string;
}

function CodeEditorInput<T extends FieldValues>({
  name,
  language,
  placeholder,
}: CodeEditorInputProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CodeEditorItem
          language={language}
          placeholder={placeholder}
          {...field}
        />
      )}
    />
  );
}

export default CodeEditorInput;
