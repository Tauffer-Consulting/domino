import { CircularProgress, Container, Typography } from "@mui/material";
import { type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
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
            <ReactMarkdown className="react-markdown-component">
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
      default:
        return <div>Unsupported file type</div>;
    }
  };

  return (
    <Container
      sx={{
        height: "90%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {renderContent()}
    </Container>
  );
};
