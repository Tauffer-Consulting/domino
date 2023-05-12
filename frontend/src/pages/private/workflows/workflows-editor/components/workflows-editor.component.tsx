import { Settings as SettingsSuggestIcon } from '@mui/icons-material'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid, Paper, Backdrop, CircularProgress } from '@mui/material'
import { withContext } from 'common/hocs/with-context.hoc'
import { WorkflowsEditorProvider } from 'context/workflows/workflows-editor.context'
import { useCallback, useEffect, useState } from 'react'

import WorkflowEditorPanelComponent from './workflow-editor-panel.component'
import { PermanentDrawerRightWorkflows } from './drawer-menu-component'
import SidebarForm from './sidebar-form.component'
import { workflowFormSchema, workflowFormUISchema } from 'common/schemas/workflowFormSchema'
import { useWorkflowsEditor } from "context/workflows/workflows-editor.context"
import { workflowFormName } from "../../../../../constants"
import { toast } from "react-toastify"
/**
 * Create workflow tab
 // TODO refactor/simplify inner files
 // TODO handle runtime errors
 // TODO make it look good
 // TODO remove all '// @ts-ignore: Unreachable code error"'
 */
export const WorkflowsEditorComponent = withContext(WorkflowsEditorProvider, () => {

  const [formSchema, setFormSchema] = useState<any>({})
  const [formUiSchema, setFormUiSchema] = useState<any>({})
  const [formModuleName, setFormModuleName] = useState('')
  //const [formTitle, setFormTitle] = useState('')
  const [drawerState, setDrawerState] = useState(false)
  const [backgropIsOpen, setBackdropIsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    clearForageData,
    workflowsEditorBodyFromFlowchart,
    setFormsForageData,
    fetchForageDataById,
    setNodes,
    setEdges,
    handleCreateWorkflow
  } = useWorkflowsEditor();

  const handleSaveWorkflow = useCallback(async () => {
    try {
      setBackdropIsOpen(true)
      const payload = await workflowsEditorBodyFromFlowchart()
      if ((!payload.tasks)) {
        setBackdropIsOpen(false)
        return toast.error('Please add tasks to the workflow')
      }
      console.log('Payload', payload)
      handleCreateWorkflow(payload)
        .then((response) => {
          toast.success('Workflow created successfully.')
          setBackdropIsOpen(false)
        })
        .catch((err) => {
          if (err.response?.status === 422) {
            setBackdropIsOpen(false)
            toast.error('Error while creating workflow, check your workflow settings and tasks.')
            return
          }
          setBackdropIsOpen(false)
          toast.error(err.response.data.detail)
        })
    } catch (err) {
      setBackdropIsOpen(false)
      console.log(err)
    }
  }, [workflowsEditorBodyFromFlowchart, handleCreateWorkflow, setBackdropIsOpen])

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

  useEffect(
    () => {
      setFormModuleName(workflowFormName)
        ; (async () => {
          setFormSchema(workflowFormSchema)
          setFormUiSchema(workflowFormUISchema)
        })()
    }, [setFormsForageData, fetchForageDataById])

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
              <WorkflowEditorPanelComponent />
            </Paper>
          </Grid>
          <PermanentDrawerRightWorkflows
            handleClose={() => setMenuOpen(!menuOpen)}
          />
        </Grid>
        <SidebarForm onClose={toggleDrawer(false)} uiSchema={formUiSchema} formSchema={formSchema} formId={formModuleName} open={drawerState} renderCheckboxes={false} />
      </div>
    </>
  )
})
