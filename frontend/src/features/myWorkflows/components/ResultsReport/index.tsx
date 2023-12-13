import { Grid, Paper } from "@mui/material";
import { RenderPDF } from "components/RenderPDF";
import DOMPurify from "dompurify";
import { useAuthenticatedGetWorkflowRunResultReport } from "features/myWorkflows/api";
import React from "react";
import ReactMarkdown from "react-markdown";
import Plot from "react-plotly.js";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";

export const ResultsReport: React.FC = () => {
  const { id, runId } = useParams<{ id: string; runId: string }>();
  const { data } = useAuthenticatedGetWorkflowRunResultReport({
    workflowId: id,
    runId,
  });
  return (
    <Paper sx={{ height: "88vh", overflowX: "scroll" }}>
      <Grid container>
        {data?.data?.map((d) => {
          switch (d.file_type) {
            case "txt":
              return <pre>{window.atob(d.base64_content)}</pre>;
            case "json":
              return (
                <pre>
                  {JSON.stringify(
                    JSON.parse(window.atob(d.base64_content)),
                    null,
                    2,
                  )}
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
                  src={`data:image/${d.file_type};base64,${d.base64_content}`}
                  alt="Content"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              );
            case "svg":
              return (
                <object
                  type="image/svg+xml"
                  data={`data:image/svg+xml;base64,${d.base64_content}`}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                >
                  Your browser does not support SVG
                </object>
              );
            case "md":
              return (
                <div
                  style={{
                    overflow: "auto",
                    maxWidth: "100%",
                    width: "100%",
                  }}
                  className="markdown-container"
                >
                  <ReactMarkdown
                    className="react-markdown-component"
                    remarkPlugins={[remarkGfm]}
                  >
                    {window.atob(d.base64_content)}
                  </ReactMarkdown>
                  ;
                </div>
              );

            case "pdf":
              return <RenderPDF base64Content={d.base64_content} />;
            case "html": {
              const decodedHTML = atob(d.base64_content);
              const sanitizedHTML = DOMPurify.sanitize(decodedHTML);

              return (
                <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
              );
            }
            case "plotly_json": {
              const utf8String = atob(d.base64_content);
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
              return <div>Unsupported file type: {d.file_type}</div>;
          }
        })}
      </Grid>
    </Paper>
  );
};
