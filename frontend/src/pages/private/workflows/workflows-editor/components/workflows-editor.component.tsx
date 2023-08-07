import { Settings as SettingsSuggestIcon } from '@mui/icons-material'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, Paper, Backdrop, CircularProgress } from '@mui/material'
import { useCallback, useState } from 'react'

import WorkflowEditorPanelComponent from './workflow-editor-panel.component'
import { PermanentDrawerRightWorkflows } from './drawer-menu-component'
import SidebarSettingsForm, { WorkflowSettingsFormSchema } from './sidebar-settings-form.component'
import { useWorkflowsEditor } from "context/workflows/workflows-editor.context"
import { toast } from "react-toastify"

import * as yup from "yup"

import { createInputsSchemaValidation } from './piece-form.component/validation';
import { yupResolver } from 'utils';
import { storageFormSchema } from './sidebar-form.component/storage-form.component';
import { ContainerResourceFormSchema } from './sidebar-form.component/container-resource-form.component';
import { AxiosError } from 'axios';
/**
 * Create workflow tab
 // TODO refactor/simplify inner files
 // TODO handle runtime errors
 // TODO make it look good
 // TODO remove all '// @ts-ignore: Unreachable code error"'
 */
export const WorkflowsEditorComponent: React.FC = () => {

  const [drawerState, setDrawerState] = useState(false)
  const [backdropIsOpen, setBackdropIsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    clearForageData,
    workflowsEditorBodyFromFlowchart,
    fetchWorkflowForage,
    setNodes,
    setEdges,
    handleCreateWorkflow,
  } = useWorkflowsEditor();

  const validateWorkflowSettings = useCallback(async (payload: any) => {
    const resolver = yupResolver(WorkflowSettingsFormSchema)
    const validatedData = await resolver(payload.workflowSettingsData)
    if (!Object.keys(validatedData.errors).length) {
      console.log("WorkflowSettings isValid: ", true)
      console.log("WorkflowSettings values: ", validatedData.values)

      setNodesWithErros([])
    } else {
      console.log("WorkflowSettings isValid: ", false)
      console.log("WorkflowSettings errors: ", validatedData.errors)

      throw new Error("Please review your workflow settings.");
    }
  }, [])

  const validateWorkflowPiecesData = useCallback(async (payload: any) => {
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

    const resolver = yupResolver(validationSchema)

    const validatedData = await resolver(payload.workflowPiecesData)

    if (!Object.keys(validatedData.errors).length) {
      console.log("WorkflowPiecesData isValid: ", true)
      console.log("WorkflowPiecesData values: ", validatedData.values)

      setNodesWithErros([])
    } else {
      console.log("WorkflowPiecesData isValid: ", false)
      console.log("WorkflowPiecesData errors: ", validatedData.errors)

      const nodeIds = Object.keys(validatedData.errors)
      setNodesWithErros(nodeIds)

      throw new Error("Please review the errors on your workflow.");
    }
  }, [])

  const [nodesWithErros, setNodesWithErros] = useState<string[]>([])

  const handleSaveWorkflow = useCallback(async () => {
    try {
      setBackdropIsOpen(true)
      const payload = await fetchWorkflowForage()

      await validateWorkflowPiecesData(payload)
      await validateWorkflowSettings(payload)

      const data = await workflowsEditorBodyFromFlowchart()

      //TODO fill workspace id correctly
      await handleCreateWorkflow({ workspace_id: "1", ...data })

      toast.success('Workflow created successfully.')
      setBackdropIsOpen(false)
    } catch (err) {
      setBackdropIsOpen(false)
      if (err instanceof Error) {
        toast.error(err.message)
      } else if (err instanceof AxiosError) {
        console.log(err.response)
        toast.error('Error while creating workflow, check your workflow settings and tasks.')
      }
    }
  },
    [
      fetchWorkflowForage,
      handleCreateWorkflow,
      validateWorkflowPiecesData,
      validateWorkflowSettings,
      workflowsEditorBodyFromFlowchart
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
        <Backdrop open={backdropIsOpen} sx={{ zIndex: 9999 }}>
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
