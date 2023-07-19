import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PieceFormItem from '../piece-form-item.component';
import { useFormContext, useWatch } from 'react-hook-form';
import { IWorkflowPieceData } from 'context/workflows/types';
import * as yup from "yup"
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context';
import { UpstreamOptions, getUpstreamOptions } from './upstream-options';

interface PieceFormProps {
  formId: string;
  schema: any;
}

export const inputsSchema = yup.lazy((value) => {
  if (!Object.keys(value).length) {
    const validationObject = {
      fromUpstream: yup.boolean().required(), //? allowed | never | always
      upstreamArgument: yup.string().nullable().required(),
      upstreamId: yup.string().nullable().required(),
      value: yup.lazy(value => {
        switch (typeof value) {
          case 'object':
            return yup.object().required();
          case 'string':
            return yup.string().required();
          case 'number':
            return yup.number().required();
          default:
            return yup.mixed(); // decide what is the default
        }
      })
    }
    const newEntries = Object.keys(value).reduce(
      (acc, val) => ({
        ...acc,
        [val]: yup.object(validationObject),
      }),
      {}
    )

    return yup.object().shape(newEntries)
  }
  return yup.mixed().notRequired()
})

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