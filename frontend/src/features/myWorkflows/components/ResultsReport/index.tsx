import { RenderB64 } from "components/RenderB64";
import { useAuthenticatedGetWorkflowRunResultReport } from "features/myWorkflows/api";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import DynamicContent from "./PDFView";

export const ResultsReport: React.FC = () => {
  const { id, runId } = useParams<{ id: string; runId: string }>();
  const { data } = useAuthenticatedGetWorkflowRunResultReport({
    workflowId: id,
    runId,
  });

  const content = useMemo(() => {
    return (
      data?.data.map((d, i) => (
        <RenderB64
          key={`render-b64-content-${i}`}
          base64_content={d.base64_content}
          file_type={d.file_type}
        />
      )) ?? []
    );
  }, [data]);

  return (
    <div
      style={{
        height: `88vh`,
        width: "100%",
        padding: 24,
        margin: 0,
        overflowY: "scroll",
        border: "2px solid #000",
      }}
    >
      <DynamicContent jsxContent={content} />
    </div>
  );
};
