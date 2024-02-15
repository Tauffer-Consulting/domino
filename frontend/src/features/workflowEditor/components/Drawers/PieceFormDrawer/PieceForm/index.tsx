import { useWorkflowsEditor } from "features/workflowEditor/context";
import {
  getUpstreamOptions,
  type UpstreamOptions,
} from "features/workflowEditor/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import PieceFormItem from "./PieceFormItem";

interface PieceFormProps {
  formId: string;
  schema: Schema;
}

const PieceForm: React.FC<PieceFormProps> = ({ formId, schema }) => {
  const { getWorkflowEdges, getWorkflowPieces } = useWorkflowsEditor();
  const [upstreamOptions, setUpstreamOptions] = useState<UpstreamOptions>({});

  const shouldRender = useMemo(() => {
    return schema?.properties;
  }, [schema]);

  const handleUpstreamOptions = useCallback(() => {
    if (!shouldRender) {
      return;
    }

    const workflowPieces = getWorkflowPieces();
    const workflowEdges = getWorkflowEdges();

    const upstreamOptions = getUpstreamOptions(
      formId,
      schema,
      workflowPieces,
      workflowEdges,
    );

    setUpstreamOptions(upstreamOptions);
  }, [getWorkflowEdges, formId, getWorkflowPieces, schema, shouldRender]);

  useEffect(() => {
    handleUpstreamOptions();
  }, [handleUpstreamOptions]);

  if (!shouldRender) return null;
  return (
    <form>
      {Object.keys(schema.properties).map((key) => (
        <div key={key}>
          <PieceFormItem
            schema={schema.properties[key]}
            itemKey={key}
            definitions={schema?.$defs}
            upstreamOptions={upstreamOptions}
          />
        </div>
      ))}
    </form>
  );
};

export default React.memo(PieceForm);
