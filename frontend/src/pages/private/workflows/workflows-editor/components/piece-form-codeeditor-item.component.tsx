import React from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

const CodeEditorItem = ({ ...register }) => {

  return (
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
  );
};

export default React.forwardRef(CodeEditorItem);
