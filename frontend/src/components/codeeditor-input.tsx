import React from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

const CodeEditorItem = React.forwardRef(({ ...register }) => (
  <CodeEditor
    language="python"
    placeholder="Enter Python code."
    padding={15}
    style={{
      fontSize: 12,
      backgroundColor: "#f5f5f5",
      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
      borderRadius: 4,
      border: "1px solid #ddd",
      width: "100%",
      minHeight: "200px",
      maxHeight: "400px",
      overflowY: "scroll",
    }}
    {...register}
  />
))

interface Props<T> {
  name: Path<T>
}

function CodeEditorInput<T extends FieldValues>({ name }: Props<T>) {
  const { control } = useFormContext()

  return (<Controller
    name={name}
    control={control}
    render={({ field }) => (
      <CodeEditorItem
        {...field}
      />
    )}
  />);
}

export default CodeEditorInput;
