import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';


interface TextCodeItemProps {
    itemSchema: any;
}

const TextCodeItem: React.FC<TextCodeItemProps> = ({ itemSchema }) => {

    const [codeValue, setCodeValue] = useState(() => {
        if (itemSchema.properties?.default) {
            return itemSchema.properties.default;
        } else {
            return `# Do not modify the function definition line 
def custom_function(input_args: list):
    # Write your code here
    print(input_args)

    # Return the output of the function as an object
    return {
        "out_arg_1": "out_value_1", 
        "out_arg_2": "out_value_2"
    }`;
        }
    });

    return (
        <CodeEditor
            value={codeValue}
            language="python"
            placeholder="Enter Python code."
            onChange={(evn: any) => setCodeValue(evn.target.value)}
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

export default React.memo(TextCodeItem);