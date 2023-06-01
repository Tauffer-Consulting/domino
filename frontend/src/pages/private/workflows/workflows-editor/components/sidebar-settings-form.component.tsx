import { 
  Drawer, 
  Grid, 
  Typography, 
  FormControl,
  TextField,
  InputLabel,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
 } from '@mui/material'
//import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
//import { JsonForms } from '@jsonforms/react'
import { useCallback, useEffect, useState } from 'react'
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'

interface ISidebarSettingsFormProps {
  open: boolean,
  onClose: (event: any) => void
}

const defaultConfigData = {
  name: '',
  scheduleInterval: 'none',
  startDate: '',
  generateReport: false,
}

const defaultStorageData = {
  storageSource: 'None',
  baseFolder: '',
  bucket: ''
}
const formId = 'workflowForm'


const SidebarSettingsForm = (props: ISidebarSettingsFormProps) => {
  const {
    open,
    onClose,
  } = props

  const storageSourceOptions = process.env.REACT_APP_DOMINO_DEPLOY_MODE === "local-compose" ? [
    "None", "Local"
  ] : [
    "None", "AWS S3"
  ]
  const [configFormData, setConfigFormData] = useState(defaultConfigData);
  const [storageFormData, setStorageFormData] = useState(defaultStorageData);
  
  const {
    setFormsForageData,
    fetchForageDataById,
  } = useWorkflowsEditor()

  const handleOnChangeStorage = useCallback(async (event: any) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    const newStorageFormData = {
      ...storageFormData,
      [name]: fieldValue,
    }

    const currentData = await fetchForageDataById(formId)
    const outputData = {
      ...currentData,
      storage: newStorageFormData
    }
    await setFormsForageData(formId, outputData)
    setStorageFormData(newStorageFormData);
  
  }, [fetchForageDataById, setFormsForageData, storageFormData])

  const handleChangeConfig = useCallback(async (event: any) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    const newFormData = {
      ...configFormData,
      [name]: fieldValue,
    }

    const currentData = await fetchForageDataById(formId)
    const outputData = {
      ...currentData,
      config: newFormData
    }
    await setFormsForageData(formId, outputData)
    setConfigFormData(newFormData);

  }, [configFormData, fetchForageDataById, setFormsForageData])

  // On load fetch data from forage and set it to the form data 
  // If data is not present then set default data to the forage
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchForageDataById(formId)
      
      const newData: any = {}
      if ('config' in data) {
        newData['config'] = data.config
      }else{
        newData['config'] = defaultConfigData
      }
      if ('storage' in data) {
        newData['storage'] = data.storage
      }else{
        newData['storage'] = defaultStorageData
      }
      await setFormsForageData(formId, newData)
      setConfigFormData(newData.config)
      setStorageFormData(newData.storage)
    }
    fetchData()
  }, [fetchForageDataById, setFormsForageData])

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
      <Grid container>
        <Grid container padding={1}>
          <Typography variant='h5' component="h5" sx={{ marginTop: '20px', marginBottom: "20px" }}>Settings</Typography >
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Name"
                  value={configFormData.name}
                  onChange={handleChangeConfig}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Interval</InputLabel>
                  <Select
                    name="scheduleInterval"
                    value={configFormData.scheduleInterval}
                    onChange={handleChangeConfig}
                    required
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="once">Once</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={configFormData.startDate}
                  onChange={handleChangeConfig}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="generateReport"
                      checked={configFormData.generateReport}
                      onChange={handleChangeConfig}
                    />
                  }
                  label="Generate Report"
                />
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid container padding={1}>
          <Grid item xs={12}>
            <Typography variant='h5' component="h5" sx={{ marginTop: '20px', marginBottom: "20px" }}>Storage</Typography >
          </Grid>
          <form id='storage-form' style={{width: '100%'}}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Interval</InputLabel>
                  <Select
                    name="storageSource"
                    value={storageFormData.storageSource}
                    onChange={handleOnChangeStorage}
                    required
                  >
                    {
                      storageSourceOptions.map((option: string, index: number) => (
                        <MenuItem key={index}  value={option}>{option}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              {
                storageFormData.storageSource === 'AWS S3' ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        name="bucket"
                        label="Bucket"
                        value={storageFormData.bucket}
                        onChange={handleOnChangeStorage}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="baseFolder"
                        label="Base Folder"
                        value={storageFormData.baseFolder}
                        onChange={handleOnChangeStorage}
                        required
                        fullWidth
                      />
                    </Grid>
                  </>

                ) : null
              }
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Drawer>
  )
}
export default SidebarSettingsForm
