import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';


interface CodeEditorItemProps {
    itemSchema: any;
    codeValue: string;
    onChange: (value: any) => void;
}

const CodeEditorItem: React.FC<CodeEditorItemProps> = ({ itemSchema, codeValue, onChange }) => {

    return (
        <CodeEditor
            value={codeValue}
            language="python"
            placeholder="Enter Python code."
            onChange={(event: any) => onChange(event.target.value)}
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
        />
    );
};

export default React.memo(CodeEditorItem);