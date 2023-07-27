import React, { useCallback, useEffect, useMemo } from 'react'
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


import PieceForm from '../piece-form.component'
import { createInputsSchemaValidation } from '../piece-form.component/validation'

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

const defaultValues: IWorkflowPieceData = {
  containerResources: defaultContainerResources,
  storage: defaultStorage,
  inputs: {},
}



const SidebarPieceForm: React.FC<ISidebarPieceFormProps> = (props) => {
  const {
    schema,
    formId,
    open,
    onClose,
    title,
  } = props

  const {
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
  } = useWorkflowsEditor()

  const SidebarPieceFormSchema = useMemo(() => {
    return yup.object().shape({
      storage: storageFormSchema,
      containerResources: ContainerResourceFormSchema,
      inputs: createInputsSchemaValidation(schema),
    });
  }, [schema])

  const resolver = useYupValidationResolver(SidebarPieceFormSchema);
  const methods = useForm({
    defaultValues,
    resolver,
    mode: "onChange"
  })
  const data = methods.watch()

  // console.log("ERRORS: ", methods.formState.errors)

  const loadData = useCallback(async () => {
    const data = await fetchForageWorkflowPiecesDataById(formId)
    methods.reset(data) // put forage data on form if exist
  }, [formId, methods.reset])

  const saveData = useCallback(async () => {
    if (formId && open) {
      await setForageWorkflowPiecesData(formId, data as IWorkflowPieceData)
    }
  }, [formId, open, data])


  //load forage
  useEffect(() => {
    if (open) {
      loadData()
    } else {
      methods.reset()
    }
  }, [open, loadData])

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
