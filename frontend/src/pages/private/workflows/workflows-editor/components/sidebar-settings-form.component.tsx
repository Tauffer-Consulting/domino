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
import { useCallback, useEffect } from 'react'
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { IWorkflowSettings, endDateTypes, scheduleIntervals } from 'context/workflows/types/settings';
import { endDateTypeType, scheduleIntervalType, storageSourceType } from 'context/workflows/types/settings';
import { Controller, useForm } from 'react-hook-form';
import * as yup from "yup";
import useYupValidationResolver from 'utils/validationResolver';

interface ISidebarSettingsFormProps {
  open: boolean,
  onClose: (event: any) => void
}

const defaultSettingsData: IWorkflowSettings = {
  name: '',
  scheduleInterval: "None",
  startDate: "",
  endDate: "",
  endDateType: "Never",
  storageSource: "None",
  baseFolder: '',
  bucket: ''
}

const storageSourceOptions = process.env.REACT_APP_DOMINO_DEPLOY_MODE === "local-compose" ? [
  {
    "label": "None",
    "value": "None"
  },
  {
    "label": "Local",
    "value": "Local"
  }
] : [
  {
    "label": "None",
    "value": "None"
  },
  {
    "label": "AWS S3",
    "value": "AWSS3"
  }
]

// TODO check yup validation
export const WorkflowSettingsFormSchema = yup.object().shape({
  name: yup.string().required(),
  scheduleInterval: yup.mixed().oneOf(Object.values(scheduleIntervals)).required(),
  startDate: yup.date().required(),
  endDate: yup.date(),
  endDateType: yup.mixed().oneOf(Object.values(endDateTypes)).required(),
  storageSource: yup.string(),
  baseFolder: yup.string(),
});

const SidebarSettingsForm = (props: ISidebarSettingsFormProps) => {
  const {
    open,
    onClose,
  } = props

  
  const {
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
  } = useWorkflowsEditor()

  const resolver = useYupValidationResolver(WorkflowSettingsFormSchema);
  const { register, watch, control, reset } = useForm<IWorkflowSettings>({ mode: "onChange", resolver })
  const formData = watch()


  const loadData = useCallback(async () => {
    const data = await fetchWorkflowSettingsData()
    if (Object.keys(data).length === 0) {
      reset(defaultSettingsData)
    }else{
      reset(data)
    }
  }, [reset, fetchWorkflowSettingsData])

  const saveData = useCallback(async () => {
    if (open){
      await setWorkflowSettingsData(formData)
    }
  }, [formData, open, setWorkflowSettingsData])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

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
      <Grid container>
        <Grid container padding={1}>
          <Typography variant='h5' component="h5" sx={{ marginTop: '20px', marginBottom: "20px" }}>Settings</Typography >
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  defaultValue={defaultSettingsData.name}
                  required
                  fullWidth
                  {...register("name")}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Interval</InputLabel>
                  <Controller
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
                  />      
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='startDate'
                  control={control}
                  defaultValue={dayjs(defaultSettingsData.startDate, 'YYYY-MM-DD HH:mm')}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DateTimePicker']}>
                        <DateTimePicker
                          label="Start Date/Time"
                          ampm={false}
                          format='DD/MM/YYYY HH:mm'
                          value={dayjs(value, 'YYYY-MM-DD HH:mm')}
                          onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD HH:mm')) }}
                          {...rest}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                />
              </Grid>
              <Grid container spacing={2} sx={{ margin: "0px" }}>
                <Grid item xs={4}>
                  <FormControl fullWidth sx={{ paddingTop: "8px" }}>
                    <InputLabel>End Date/Time</InputLabel>
                    <Controller
                      name="endDateType"
                      control={control}
                      defaultValue={defaultSettingsData.endDateType}
                      render={({ field }) => (
                        <Select
                          {...field}
                          onChange={(event) =>
                            field.onChange(event.target.value as endDateTypeType)
                          }
                        >
                          <MenuItem value="Never">Never</MenuItem>
                          <MenuItem value="UserDefined">User defined</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <Controller
                    name='endDate'
                    control={control}
                    defaultValue={dayjs(defaultSettingsData.endDate, 'YYYY-MM-DD HH:mm')}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']} sx={{ width: "100%" }}>
                          <DateTimePicker
                            label="End Date/Time"
                            ampm={false}
                            format='DD/MM/YYYY HH:mm'
                            value={dayjs(value, 'YYYY-MM-DD HH:mm')}
                            onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD HH:mm')) }}
                            sx={{ width: "100%" }}
                            {...rest}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    )}
                  />
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
                  <InputLabel>Storage Source</InputLabel>
                  <Controller
                    name="storageSource"
                    control={control}
                    defaultValue={defaultSettingsData.storageSource}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.value as storageSourceType)
                        }
                      >
                        {
                          storageSourceOptions.map((option: any, index: number) => (
                            <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                          ))
                        }
                      </Select>
                    )}
                    />
                </FormControl>
              </Grid>
              {
                formData.storageSource === 'AWSS3' ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Bucket"
                        defaultValue={defaultSettingsData.bucket}
                        required
                        fullWidth
                        {...register("bucket")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Base Folder"
                        defaultValue={defaultSettingsData.baseFolder}
                        required
                        fullWidth
                        {...register("baseFolder")}
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
