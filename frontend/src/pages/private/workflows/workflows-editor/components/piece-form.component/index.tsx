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

type UpstreamOptions = Record<string, string[]>

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
    const upstreamOptions = {} as Record<string, string[]>


    for (const ed of workflowEdges) {
      if (ed.target === formId) {
        upstreamIds.push(ed.source)
      }
    }

    /**
     *  TODO: fix counter
     */
    Object.keys(schema.properties).map(key => {
      const currentSchema = schema.properties[key]
      upstreamOptions[key] = upstreamIds.flatMap(upstreamId => {
        const upSchema = workflowPieces[upstreamId].output_schema.properties
        const currentType = getInputType(currentSchema)
        const options: string[] = []
        let counter = 0
        for (const outputs in upSchema) {
          const upType = getInputType(upSchema[outputs])
          if (upType === currentType) {
            let value = `${workflowPieces[upstreamId]?.name} - ${upSchema[outputs].title}`
            if (options.includes(value)) {
              ++counter
              value = `${value} (${counter})`
            }
            options.push(value)
          }
        }
        return options
      })

      setUpstreamOptions(upstreamOptions)
    })
  }, [fetchForageWorkflowEdges, formId, getForageWorkflowPieces, getInputType, schema.properties, shouldRender])

  useEffect(() => {
    handleUpstreamOptions()
  }, [])

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
