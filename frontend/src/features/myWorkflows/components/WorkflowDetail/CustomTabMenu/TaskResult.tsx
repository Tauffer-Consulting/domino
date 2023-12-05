import {
  Button,
  CircularProgress,
  Container,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import Plot from "react-plotly.js";
import remarkGfm from "remark-gfm";
import "./styles.css";
// import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

interface ITaskResultProps {
  isLoading: boolean;
  base64_content?: string;
  file_type?: string;
}

export const TaskResult = (props: ITaskResultProps) => {
  const { base64_content, file_type } = props;

  const style: CSSProperties = {
    height: "100%",
    width: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  };

  const renderContent = () => {
    if (props.isLoading) {
      return <CircularProgress />;
    }

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
        return (
          <div style={{ width: "100%", ...style }}>
            PDF result display not yet implemented
            {/* <PDFViewer>
                            <Document file={`data:application/pdf;base64,${base64_content}`}>
                                <Page pageNumber={1} />
                            </Document>
                        </PDFViewer> */}
          </div>
        );
      case "html":
        return (
          <div style={{ width: "100%", ...style }}>
            HTML result display not yet implemented
          </div>
          // <iframe
          //     src={`data:text/html;base64,${base64_content}`}
          //     style={{ width: '100%', height: '100%' }}
          // />
        );
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

  const downloadContent = useCallback(() => {
    let href = "";
    switch (file_type) {
      case "txt":
        href = `data:text/plain;base64,${base64_content}`;
        break;
      case "plotly_json":
      case "json":
        href = `data:application/json;base64,${base64_content}`;
        break;
      case "jpeg":
      case "png":
      case "bmp":
      case "gif":
      case "tiff":
        href = `data:image/${file_type};base64,${base64_content}`;
        break;
      case "svg":
        href = `data:image/svg+xml;base64,${base64_content}`;
        break;
      case "md":
        href = `data:text/markdown;base64,${base64_content}`;
        break;
      case "pdf":
        href = `data:application/pdf;base64,${base64_content}`;
        break;
      case "html":
        href = `data:text/html;base64,${base64_content}`;
        break;
      default:
        href = `data:text/plain;base64,${base64_content}`;
        break;
    }

    const a = document.createElement("a"); // Create <a>
    a.href = href; // Image Base64 Goes here
    a.download = `download.${file_type}`; // File name Here
    a.click(); // Downloaded file
  }, [base64_content, file_type]);

  return (
    <Container
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      {renderContent()}
      {!!base64_content && !!file_type && (
        <Tooltip title="Will download the raw result content ">
          <Button variant="contained" onClick={downloadContent}>
            Download content
          </Button>
        </Tooltip>
      )}
    </Container>
  );
};
