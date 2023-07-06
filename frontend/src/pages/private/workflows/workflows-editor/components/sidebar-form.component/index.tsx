import React, { useCallback, useEffect, useState } from 'react'
import {
  Drawer,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormProvider, useForm } from 'react-hook-form';

import * as yup from "yup"

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'

import { extractDefaultValues } from 'utils'
import PieceForm from '../piece-form.component'

import ContainerResourceForm, { ContainerResourceFormSchema, defaultContainerResources } from './container-resource-form.component';

import StorageForm, { defaultStorage, storageFormSchema } from './storage-form.component';

import { IWorkflowPieceData } from 'context/workflows/types';
import useYupValidationResolver from 'utils/validationResolver';

interface ISidebarPieceFormProps {
  formId: string,
  schema: Record<string, unknown>,
  title: string,
  open: boolean,
  onClose: (event: any) => void,
}

const defaultValues = {
  containerResources: defaultContainerResources,
  storage: defaultStorage,
  inputs: {},
}

const SidebarPieceFormSchema = yup.object().shape({
  storage: storageFormSchema,
  containerResources: ContainerResourceFormSchema,
  inputs: yup.object().unknown()
}) as unknown as ReturnType<typeof yup.object>;

const SidebarPieceForm: React.FC<ISidebarPieceFormProps> = (props) => {
  const {
    schema,
    formId,
    open,
    onClose,
    title,
  } = props

  const [formData, setFormData] = useState<any>({})
  const [formJsonSchema, setFormJsonSchema] = useState<any>({ ...schema })
  const {
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setFormsForageData,
    fetchForageDataById,
    getForageUpstreamMap,
    setForageUpstreamMap,
    getNameKeyUpstreamArgsMap
  } = useWorkflowsEditor()

  const resolver = useYupValidationResolver(SidebarPieceFormSchema);

  const methods = useForm({
    defaultValues,
    resolver,
    mode: "onChange"
  })
  const data = methods.watch()

  const loadData = useCallback(async () => {
    const data = await fetchForageWorkflowPiecesDataById(formId)
    methods.reset(data) // put forage data on form if exist
  }, [formId, methods.reset])

  const saveData = useCallback(async () => {
    if (formId && open) {
      await setForageWorkflowPiecesData(formId, data as IWorkflowPieceData)
    }
  }, [formId, open, data])

  // Update form data in forage
  const handleOnChange = useCallback(async ({ errors, data }: { errors?: any, data: any }) => {
    try {
      var upstreamMap = await getForageUpstreamMap()
      const nameKeyUpstreamArgsMap = await getNameKeyUpstreamArgsMap()
      var upstreamMapFormInfo = (formId in upstreamMap) ? upstreamMap[formId] : {}
      for (const key in data) {
        const fromUpstream = upstreamMapFormInfo[key] ? upstreamMapFormInfo[key].fromUpstream : false
        const upstreamId = fromUpstream && upstreamMapFormInfo[key] ? upstreamMapFormInfo[key].upstreamId : null
        if (key !== 'storage') {
          var dataValue = data[key]
          if (Array.isArray(dataValue)) {
            const auxValue = []
            for (const element of dataValue) {
              const newValue: any = {}
              if (typeof element === 'object') {
                for (const [_key, _value] of Object.entries(element)) {
                  newValue[_key] = {
                    fromUpstream: fromUpstream,
                    upstreamId: upstreamId,
                    upstreamArgument: null,
                    value: _value
                  }
                }
                auxValue.push(newValue)
              } else {
                newValue[key] = {
                  fromUpstream: fromUpstream,
                  upstreamId: upstreamId,
                  upstreamArgument: null,
                  value: element
                }
                auxValue.push(newValue)
              }
            }
            dataValue = auxValue
          }
          upstreamMapFormInfo[key] = {
            fromUpstream: fromUpstream,
            upstreamId: upstreamId,
            upstreamArgument: fromUpstream && nameKeyUpstreamArgsMap[data[key]] ? nameKeyUpstreamArgsMap[data[key]] : null,
            value: (dataValue === null || dataValue === undefined) ? null : dataValue
          }
        }
      }

      upstreamMap[formId] = upstreamMapFormInfo
      await setFormsForageData(formId, data)
      await setForageUpstreamMap(upstreamMap)
    } catch (err) {
      console.log(err)
    }
  }, [formId, setFormsForageData, getForageUpstreamMap, setForageUpstreamMap, getNameKeyUpstreamArgsMap])

  useEffect(() => {
    setFormJsonSchema({ ...schema })
  }, [schema])

  //load forage
  useEffect(() => {
    if (open) {
      loadData()
    } else {
      methods.reset()
    }
  }, [open, loadData])

  // When opened fetch forage data and update forms data
  useEffect(() => {
    const fetchForage = async () => {
      const forageData = await fetchForageDataById(formId)

      if (!forageData) {
        const defaultData = extractDefaultValues(formJsonSchema)
        handleOnChange({ data: defaultData })
        setFormData(defaultData)
        return
      }

      handleOnChange({ data: forageData })
      setFormData(forageData)
    }
    if (open) { fetchForage() }

  }, [
    formId,
    formJsonSchema,
    open,
    fetchForageDataById,
    setFormsForageData,
    handleOnChange,
  ])

  // save on forage
  useEffect(() => {
    saveData()
  }, [saveData])

  return (
    <Drawer
      anchor='left'
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": { marginTop: "4rem", width: "33%", maxWidth: '500px', minWidth: '300px' }
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
    >
      <div style={{ width: '100%', maxWidth: '500px', minWidth: '300px', paddingLeft: '20px', paddingRight: '20px' }}>
        <Typography
          variant='h5'
          component="h5"
          sx={{ marginTop: '20px', marginBottom: "20px" }}
        >
          {title}
        </Typography >

        <Grid container>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
              <Grid item xs={10}>
                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Input Arguments</Typography>
              </Grid>
              <Grid item xs={12 - 10}>
                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Upstream</Typography>
              </Grid>
            </Grid>

            <Grid container sx={{ paddingBottom: "25px" }}>
              <FormProvider {...methods} >
                <Grid item xs={12} className='sidebar-jsonforms-grid'>
                  <Grid item xs={12}>
                    <PieceForm
                      formId={formId}
                      schema={schema}
                      initialData={formData}
                      onChange={handleOnChange}
                    />
                  </Grid>

                  <div style={{ marginBottom: '50px' }} />

                  <Accordion
                    sx={{
                      '&.MuiAccordion-root:before': {
                        display: 'none',
                      },
                    }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>
                        Advanced Options
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <StorageForm />
                      <div style={{ marginBottom: '50px' }} />
                      <ContainerResourceForm />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </FormProvider>

            </Grid>
          </div>
        </Grid>
        <div style={{ marginBottom: '70px' }} />
      </div>
    </Drawer>
  )
}

export default SidebarPieceForm;
