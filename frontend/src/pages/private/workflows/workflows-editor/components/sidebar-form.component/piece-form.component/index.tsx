import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PieceFormItem from './piece-form-item.component';
import { useFormContext } from 'react-hook-form';
import { IWorkflowPieceData } from 'context/workflows/types';

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context';
import { UpstreamOptions, getUpstreamOptions } from './upstream-options';

interface PieceFormProps {
  formId: string;
  schema: any;
}

const PieceForm: React.FC<PieceFormProps> = ({ formId, schema }) => {
  const { fetchForageWorkflowEdges, getForageWorkflowPieces } = useWorkflowsEditor()
  const { control } = useFormContext<IWorkflowPieceData>()
  const [upstreamOptions, setUpstreamOptions] = useState<UpstreamOptions>({})

  const shouldRender = useMemo(() => {
    return schema?.properties
  }, [schema])

  const handleUpstreamOptions = useCallback(async () => {
    if (!shouldRender) {
      return
    }

    const workflowPieces = await getForageWorkflowPieces();
    const workflowEdges = await fetchForageWorkflowEdges();

    const upstreamOptions = getUpstreamOptions(formId, schema, workflowPieces, workflowEdges)
    setUpstreamOptions(upstreamOptions)

  }, [fetchForageWorkflowEdges, formId, getForageWorkflowPieces, schema, shouldRender])

  useEffect(() => {
    handleUpstreamOptions()
  }, [handleUpstreamOptions])

  if (!shouldRender) return null;
  return (
    <form>
      {
        Object.keys(schema.properties).map(key => (
          <div key={key}>
            <PieceFormItem
              formId={formId}
              schema={schema.properties[key]}
              itemKey={key}
              control={control}
              definitions={schema?.definitions}
              upstreamOptions={upstreamOptions[key] ?? []}
            />
          </div>
        ))
      }
    </form>
  );
};

export default React.memo(PieceForm);
