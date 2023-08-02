import { Settings as SettingsSuggestIcon } from '@mui/icons-material'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, Paper, Backdrop, CircularProgress } from '@mui/material'
import { withContext } from 'common/hocs/with-context.hoc'
import { WorkflowsEditorProvider } from 'context/workflows/workflows-editor.context'
import { useCallback, useEffect, useRef, useState } from 'react'

import WorkflowEditorPanelComponent from './workflow-editor-panel.component'
import { PermanentDrawerRightWorkflows } from './drawer-menu-component'
import SidebarSettingsForm from './sidebar-settings-form.component'
import { workflowFormSchema, workflowFormUISchema } from 'common/schemas/workflowFormSchema'
import { useWorkflowsEditor } from "context/workflows/workflows-editor.context"
import { workflowFormName } from "../../../../../constants"
import { toast } from "react-toastify"

import * as yup from "yup"

import { createInputsSchemaValidation } from './piece-form.component/validation';
import yupResolver from 'utils/validationResolver';
import { storageFormSchema } from './sidebar-form.component/storage-form.component';
import { ContainerResourceFormSchema } from './sidebar-form.component/container-resource-form.component';
import { IWorkflowElement } from 'services/requests/workflow';
/**
 * Create workflow tab
 // TODO refactor/simplify inner files
 // TODO handle runtime errors
 // TODO make it look good
 // TODO remove all '// @ts-ignore: Unreachable code error"'
 */
export const WorkflowsEditorComponent: React.FC = () => {

  const [drawerState, setDrawerState] = useState(false)
  const [backgropIsOpen, setBackdropIsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    clearForageData,
    workflowsEditorBodyFromFlowchart,
    setNodes,
    setEdges,
    handleCreateWorkflow,
    fetchForagePieceById
  } = useWorkflowsEditor();

  const validateWorkflowForms = useCallback(async (payload: any) => {
    const workflowData = payload.workflow
    const workflowRequiredFields: any = {
      "name": "Name",
      "scheduleInterval": "Schedule Interval",
      "startDate": "Start Date",
    }

    if (!workflowData || workflowData === undefined) {
      throw new Error('Workflow settings are missing.')
    }

    for (const fieldKey in workflowData) {
      if (fieldKey in workflowRequiredFields) {
        if (!(fieldKey in workflowData) || !workflowData[fieldKey]) {
          throw new Error(`Please fill the ${workflowRequiredFields[fieldKey]} field in Settings.`)
        }
      }
    }

  }, [])

  const validateTasksForms = useCallback(async (payload: any) => {
    const tasksData: any = payload.tasks
    //const storageSchema = workflowFormSchema.properties.storage
    for (const entry of Object.entries(tasksData)) {
      const [taskId, taskData]: [string, any] = entry;
      const taskPieceId = taskData.piece.id;
      const pieceGroundTruth: any = await fetchForagePieceById(taskPieceId)
      const pieceLabel = pieceGroundTruth?.style?.label ? pieceGroundTruth.style.label : pieceGroundTruth.name
      if (!pieceGroundTruth) {
        throw new Error(`Task ${taskId} has an invalid piece.`)
      }
      const pieceInputSchema: any = pieceGroundTruth.input_schema
      const taskPieceInputData = taskData.piece_input_kwargs
      const requiredFields = pieceInputSchema.required ? pieceInputSchema.required : []

      for (const required of requiredFields) {
        if (!(required in taskPieceInputData)) {
          throw new Error(`${pieceLabel} is missing required input fields.`)
        }
      }
    }
    return


  }, [fetchForagePieceById])

  const [nodesWithErros,setNodesWithErros] = useState<string[]>([])

  const handleSaveWorkflow = useCallback(async () => {
    try {
      //setBackdropIsOpen(true)
      const payload = await workflowsEditorBodyFromFlowchart()

      const validationSchema = yup.object().shape(Object.entries(payload.workflowPieces).reduce((acc, [key, value]) => {
        return {
          [key]: yup.object({
            storage: storageFormSchema,
            containerResources: ContainerResourceFormSchema,
            inputs: createInputsSchemaValidation((value as any).input_schema)
          }),
          ...acc
        }
      }, {})) as any

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const resolver = yupResolver(validationSchema)

      const validatedData = await resolver(payload.workflowPiecesData)

      if (!Object.keys(validatedData.errors).length) {
        console.log("isValid: ", true)
        console.log("values: ", validatedData.values)
        setNodesWithErros([])
      } else {
        console.log("isValid: ", false)
        console.log("errors: ", validatedData.errors)
        const nodeIds = Object.keys(validatedData.errors)
        setNodesWithErros(nodeIds)
        return toast.error('Please review the errors on your workflow')
      }


      // if ((!payload.tasks)) {
      //   setBackdropIsOpen(false)
      //   return toast.error('Please add tasks to the workflow')
      // }
      // // try {
      // //   await validateWorkflowForms(payload)
      // //   await validateTasksForms(payload)
      // // }
      // // catch (err: any) {
      // //   setBackdropIsOpen(false)
      // //   return toast.error(err.message)
      // // }

      // handleCreateWorkflow(payload)
      //   .then((response) => {
      //     toast.success('Workflow created successfully.')
      //     setBackdropIsOpen(false)
      //   })
      //   .catch((err) => {
      //     if (err.response?.status === 422) {
      //       setBackdropIsOpen(false)
      //       console.log('response', err.response)
      //       toast.error('Error while creating workflow, check your workflow settings and tasks.')
      //       return
      //     }
      //     setBackdropIsOpen(false)
      //     toast.error(err.response.data.detail)
      //   })
    } catch (err) {
      setBackdropIsOpen(false)
      console.log(err)
    }
  },
    [
      workflowsEditorBodyFromFlowchart,
      handleCreateWorkflow,
      setBackdropIsOpen,
      validateTasksForms,
      validateWorkflowForms
    ]
  )

  // @ts-ignore: Unreachable code error
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerState(open)
  }

  // Open Config Worflow Form
  const handleConfigWorkflow = useCallback(() => {
    setDrawerState(true)
  }, [])

  const handleClear = useCallback(async () => {
    setNodes([])
    setEdges([])
    await clearForageData()
  }, [setNodes, setEdges, clearForageData])

  return (
    <>
      <div className='reactflow-parent-div'>
        <Backdrop open={backgropIsOpen} sx={{ zIndex: 9999 }}>
          <CircularProgress />
        </Backdrop>
        <Grid
          container
          spacing={4}
          direction='row'
          justifyContent='flex-start'
          alignItems='flex-start'
          style={{ marginLeft: 0, marginTop: 0 }}
        >
          <Grid
            item
            xs={12}
            sx={{
              paddingLeft: '0px',
              paddingRight: '300px',
              marginLeft: 0
            }}
          >
            <Grid
              container
              spacing={1}
              direction='row'
              justifyContent='flex-end'
              alignItems='center'
              style={{ marginBottom: 10 }}
            >
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  className='buttons-bar'
                  startIcon={<SettingsSuggestIcon />}
                  onClick={() => handleConfigWorkflow()}
                >
                  Settings
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  startIcon={<SaveIcon />}
                  onClick={handleSaveWorkflow}
                >
                  Save
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  startIcon={<DownloadIcon />}
                >
                  Load
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Paper>
              <WorkflowEditorPanelComponent nodesWithErros={nodesWithErros} />
            </Paper>
          </Grid>
          <PermanentDrawerRightWorkflows
            handleClose={() => setMenuOpen(!menuOpen)}
          />
        </Grid>
        <SidebarSettingsForm
          onClose={toggleDrawer(false)}
          open={drawerState}
        />
      </div>
    </>
  )
}
