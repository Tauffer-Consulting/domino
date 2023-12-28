import { Typography } from "@mui/material";
import HtmlRenderer from "components/HTMLRender";
import { RenderPDF } from "components/RenderPDF";
import React, { type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import Plot from "react-plotly.js";
import remarkGfm from "remark-gfm";

interface Props {
  base64_content: string;
  file_type: string;
  style?: CSSProperties;
}

export const RenderB64: React.FC<Props> = ({
  base64_content,
  file_type,
  style,
}) => {
  if (!base64_content || !file_type) {
    return <Typography variant="h2">No content</Typography>;
  }
  switch (file_type) {
    case "txt":
      return <pre style={style}>{window.atob(base64_content)}</pre>;
    case "json":
      return (
        <pre style={style}>
          {JSON.stringify(JSON.parse(window.atob(base64_content)), null, 2)}
        </pre>
      );
    case "jpeg":
    case "jpg":
    case "png":
    case "bmp":
    case "gif":
    case "tiff":
      return (
        <img
          src={`data:image/${file_type};base64,${base64_content}`}
          alt="Content"
          style={{ maxWidth: "100%", maxHeight: "100%", ...style }}
        />
      );
    case "svg":
      return (
        <object
          type="image/svg+xml"
          data={`data:image/svg+xml;base64,${base64_content}`}
          style={{ maxWidth: "100%", maxHeight: "100%", ...style }}
        >
          Your browser does not support SVG
        </object>
      );
    case "md":
      return (
        <div
          style={{ overflow: "auto", maxWidth: "100%", width: "100%" }}
          className="markdown-container"
        >
          <ReactMarkdown
            className="react-markdown-component"
            remarkPlugins={[remarkGfm]}
          >
            {window.atob(base64_content)}
          </ReactMarkdown>
          ;
        </div>
      );

    case "pdf":
      return <RenderPDF base64Content={base64_content} />;
    case "html": {
      const decodedHTML = atob(base64_content);

      return <HtmlRenderer html={decodedHTML} />;
    }
    case "plotly_json": {
      const utf8String = atob(base64_content);
      const decodedJSON = JSON.parse(utf8String);
      return (
        <Plot
          data={decodedJSON.data}
          layout={decodedJSON.layout}
          style={{ width: "100%", height: "100%" }}
        />
      );
    }
    default:
      return <div>Unsupported file type</div>;
  }
};
