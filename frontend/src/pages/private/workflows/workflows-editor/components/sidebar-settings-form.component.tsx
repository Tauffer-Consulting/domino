import {
  Drawer,
  Grid,
  Typography,
  FormControl,
  TextField,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
//import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
//import { JsonForms } from '@jsonforms/react'
import { useCallback, useEffect, useState } from 'react'
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { IWorkflowSettings } from 'context/workflows/types/settings';
import { endDateTypeType, scheduleIntervalType, storageSourceType } from 'context/workflows/types/settings';
import { Controller, useFormContext, useForm } from 'react-hook-form';


interface ISidebarSettingsFormProps {
  open: boolean,
  onClose: (event: any) => void
}

const defaultSettingsData: IWorkflowSettings = {
  name: '',
  scheduleInterval: "None",
  startDate: '',
  endDate: '',
  endDateType: "Never",
  storageSource: "None",
  baseFolder: '',
  bucket: ''
}



// TODO - Refactor this to use react-hook-form 
// TODO - must save data in workflowSettings forageKey

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
  const [configFormData, setConfigFormData] = useState(defaultSettingsData);
  const [isEndDateTimeDisabled, setIsEndDateTimeDisabled] = useState(true);
  const {
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData
  } = useWorkflowsEditor()

  // const methods = useForm({
  //   defaultValues,
  //   resolver,
  //   mode: "onChange"
  // })

  const {register}  =  useForm()

  //const data = methods.watch()

  //console.log('data', data)
  console.log('aq')

  //const { register, formState, control } = useFormContext<IWorkflowSettings>();

  // const handleOnChangeStorage = useCallback(async (event: any) => {
  //   const { name, value, type, checked } = event.target;
  //   const fieldValue = type === 'checkbox' ? checked : value;

  //   const newStorageFormData = {
  //     ...storageFormData,
  //     [name]: fieldValue,
  //   }

  //   const currentData = await fetchWorkflowSettingsData()

  //   // //const currentData = await fetchForageDataById(formId)
  //   // const outputData = {
  //   //   ...currentData,
  //   //   storage: newStorageFormData
  //   // }
  //   // await setFormsForageData(formId, outputData);
  //   // setStorageFormData(newStorageFormData);

  // }, [storageFormData])

  // const handleChangeConfig = useCallback(async (event: any, source: string) => {
  //   // console.log('aqui', event?.target?.value)
  //   // console.log('aqui', event?.target?.name)
  //   // let name = event?.target?.name || "";
  //   // let fieldValue = event?.target?.value || "";
  //   // if (source === 'endDateTime' || source === 'startDateTime') {
  //   //   const newDate = event;
  //   //   fieldValue = new Date(newDate).toISOString();
  //   //   name = source;
  //   // } else {
  //   //   const { name, value, type, checked } = event.target;
  //   //   fieldValue = type === 'checkbox' ? checked : value;
  //   // }

  //   // const newFormData = {
  //   //   ...configFormData,
  //   //   [name]: fieldValue,
  //   // }

  //   // // // changes the disable state of the selectEndDateTime
  //   // if (name === 'endDateType') {
  //   //   setIsEndDateTimeDisabled(fieldValue === 'never')
  //   //   newFormData.endDateType = null
  //   // }

  //   // // const currentData = await fetchForageDataById(formId)
  //   // // const outputData = {
  //   // //   ...currentData,
  //   // //   config: newFormData
  //   // // }
  //   // // await setFormsForageData(formId, outputData)
  //   //  setConfigFormData(newFormData);

  // }, [configFormData])

  // // On load fetch data from forage and set it to the form data 
  // // If data is not present then set default data to the forage
  // useEffect(() => {
  //   if (!open) return

  //   const fetchData = async () => {
  //     // let data = await fetchWorkflowSettingsData()
  //     // if (data === undefined || data === null){
  //     //   data = {}
  //     // }
  //     // const newData: any = {}
  //     // if ('config' in data) {
  //     //   newData['config'] = data.config
  //     // } else {
  //     //   newData['config'] = defaultSettingsData
  //     // }
  //     // if ('storage' in data) {
  //     //   newData['storage'] = data.storage
  //     // } else {
  //     //   newData['storage'] = defaultStorageData
  //     // }
  //     // await setWorkflowSettingsData(newData)
  //     // setConfigFormData(newData.config)
  //     // setStorageFormData(newData.storage)
  //   }
  //   fetchData()
  // }, [open, fetchWorkflowSettingsData, setWorkflowSettingsData])

  console.log("AQUI")

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
                  label="Name"
                  value={configFormData.name}
                  required
                  fullWidth
                  {...register("name")}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Interval</InputLabel>
                  {/* <Controller
                    name="scheduleInterval"
                    control={control}
                    defaultValue="None"
                    render={({ field }) => (
                      <Select
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.value as scheduleIntervalType)
                        }
                      >
                          <MenuItem value="None">None</MenuItem>
                          <MenuItem value="Once">Once</MenuItem>
                          <MenuItem value="Hourly">Hourly</MenuItem>
                          <MenuItem value="Daily">Daily</MenuItem>
                          <MenuItem value="Weekly">Weekly</MenuItem>
                          <MenuItem value="Monthly">Monthly</MenuItem>
                          <MenuItem value="Yearly">Yearly</MenuItem>
                      </Select>
                    )}
                  >
                    
                  </Controller> */}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']} sx={{ width: "100%" }}>
                    <DateTimePicker
                      label="Start Date/Time"
                      value={dayjs(configFormData.startDate)}
                      ampm={false}
                      format='DD/MM/YYYY HH:mm'
                      sx={{ width: "100%" }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
              <Grid container spacing={2} sx={{ margin: "0px" }}>
                <Grid item xs={4}>
                  <FormControl fullWidth sx={{ paddingTop: "8px" }}>
                    <InputLabel>End Date/Time</InputLabel>
                    <Select
                      name="endDateType"
                      value={configFormData.endDateType}
                    >
                      <MenuItem value="never">Never</MenuItem>
                      <MenuItem value="user-defined">User defined</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']} sx={{ width: "100%" }}>
                      <DateTimePicker
                        disabled={isEndDateTimeDisabled}
                        label="End Date/Time"
                        value={dayjs(configFormData.endDate)}
                        ampm={false}
                        format='DD/MM/YYYY HH:mm'
                        sx={{ width: "100%" }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid container padding={1}>
          <Grid item xs={12}>
            <Typography variant='h5' component="h5" sx={{ marginTop: '20px', marginBottom: "20px" }}>Storage</Typography >
          </Grid>
          <form id='storage-form' style={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Interval</InputLabel>
                  <Select
                    name="storageSource"
                    value={configFormData.storageSource}
                    required
                  >
                    {
                      storageSourceOptions.map((option: string, index: number) => (
                        <MenuItem key={index} value={option}>{option}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              {
                configFormData.storageSource === 'AWSS3' ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        name="bucket"
                        label="Bucket"
                        value={configFormData.bucket}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="baseFolder"
                        label="Base Folder"
                        value={configFormData.baseFolder}
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
