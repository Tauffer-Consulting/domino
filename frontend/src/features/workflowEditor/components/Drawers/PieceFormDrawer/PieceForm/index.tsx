import { useWorkflowsEditor } from "features/workflowEditor/context";
import { type IWorkflowPieceData } from "features/workflowEditor/context/types";
import {
  getUpstreamOptions,
  type UpstreamOptions,
} from "features/workflowEditor/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import PieceFormItem from "./PieceFormItem";

interface PieceFormProps {
  formId: string;
  schema: Schema;
}

const PieceForm: React.FC<PieceFormProps> = ({ formId, schema }) => {
  const { fetchForageWorkflowEdges, getForageWorkflowPieces } =
    useWorkflowsEditor();
  const { control } = useFormContext<IWorkflowPieceData>();
  const [upstreamOptions, setUpstreamOptions] = useState<UpstreamOptions>({});

  const shouldRender = useMemo(() => {
    return schema?.properties;
  }, [schema]);

  const handleUpstreamOptions = useCallback(() => {
    if (!shouldRender) {
      return;
    }

    const workflowPieces = getForageWorkflowPieces();
    const workflowEdges = fetchForageWorkflowEdges();

    const upstreamOptions = getUpstreamOptions(
      formId,
      schema,
      workflowPieces,
      workflowEdges,
    );

    setUpstreamOptions(upstreamOptions);
  }, [
    fetchForageWorkflowEdges,
    formId,
    getForageWorkflowPieces,
    schema,
    shouldRender,
  ]);

  useEffect(() => {
    handleUpstreamOptions();
  }, [handleUpstreamOptions]);

  if (!shouldRender) return null;
  return (
    <form>
      {Object.keys(schema.properties).map((key) => (
        <div key={key}>
          <PieceFormItem
            formId={formId}
            schema={schema.properties[key]}
            itemKey={key}
            control={control}
            definitions={schema?.$defs}
            upstreamOptions={upstreamOptions}
          />
        </div>
      ))}
    </form>
  );
};

export default React.memo(PieceForm);
