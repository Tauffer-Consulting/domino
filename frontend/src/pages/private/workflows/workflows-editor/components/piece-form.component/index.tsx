import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PieceFormItem from '../piece-form-item.component';
import { useFormContext } from 'react-hook-form';
import { IWorkflowPieceData } from 'context/workflows/types';
import * as yup from "yup"
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context';

interface PieceFormProps {
  formId: string;
  schema: any;
}

export type Option = {
   id: string,
   argument: string,
   value: string
}

type UpstreamOptions = Record<string, Option[]>

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
  const { register, control, watch } = useFormContext<IWorkflowPieceData>()
  const { inputs } = watch()
  const [upstreamOptions, setUpstreamOptions] = useState<UpstreamOptions>({})

  const shouldRender = useMemo(() => {
    return schema.properties && Object.keys(inputs).length
  }, [schema, inputs])

  const getInputType = useCallback((schema: Record<string, any>) => {
    let type = schema.format ? schema.format : schema.type
    if ('allOf' in schema || "oneOf" in schema || "anyOf" in schema) {
      type = 'enum'
    }
    return type as string
  }, [])

  const handleUpstreamOptions = useCallback(async () => {
    if (!shouldRender) {
      return
    }

    const workflowPieces = await getForageWorkflowPieces();
    const workflowEdges = await fetchForageWorkflowEdges();
    const upstreamIds: string[] = []
    const upstreamOptions = {} as Record<string, Option[]>

    for (const ed of workflowEdges) {
      if (ed.target === formId) {
        upstreamIds.push(ed.source)
      }
    }

    Object.keys(schema.properties).forEach(key => {
      const currentSchema = schema.properties[key]
      upstreamOptions[key] = upstreamIds.flatMap(upstreamId => {
        const upSchema = workflowPieces[upstreamId].output_schema.properties
        const currentType = getInputType(currentSchema)
        const options: Option[] = []
        for (const outputs in upSchema) {
          const upType = getInputType(upSchema[outputs])
          if (upType === currentType) {
            const value = `${workflowPieces[upstreamId]?.name} - ${upSchema[outputs].title} (${upstreamId.substring(2, 8)})`
            const upstreamArgument = outputs
            options.push({ id: upstreamId, argument: upstreamArgument, value })
          }
        }
        return options
      })

      setUpstreamOptions(upstreamOptions)
    })
  }, [fetchForageWorkflowEdges, formId, getForageWorkflowPieces, getInputType, schema.properties, shouldRender])

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
              inputProperties={inputs[key]}
              register={register}
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
