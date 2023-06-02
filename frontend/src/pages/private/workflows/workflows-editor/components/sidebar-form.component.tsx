import { useCallback, useEffect, useState } from 'react'
import {
  Divider,
  Drawer,
  Grid,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { extractDefaultValues } from 'utils'
import DominoForm from './domino-form.component'
// import { createAjv } from '@jsonforms/core'
// import { operatorStorageSchema } from 'common/schemas/storageSchemas'
// import { workflowFormSchema } from 'common/schemas/workflowFormSchema'
// import { containerResourcesSchema } from 'common/schemas/containerResourcesSchemas'
// import { toast } from 'react-toastify'


// const handleDefaultsAjv = createAjv({ useDefaults: true })

interface ISidebarFormProps {
  formSchema: any,
  uiSchema?: any,
  formId: string,
  open: boolean,
  onClose: (event: any) => void,
  title?: string,
  isPieceForm?: boolean,
}

// TODO check if these values make sense
const minAcceptedMemory = 128
const minAcceptedCpu = 100
const maxAcceptedMemory = 12800
const maxAcceptedCpu = 10000

const storageValidationValues: any = {
  "memory": {
    "min": minAcceptedMemory,
    "max": maxAcceptedMemory
  },
  "cpu": {
    "min": minAcceptedCpu,
    "max": maxAcceptedCpu
  }
}


const defaultContainerResources = {
  "useGpu": false,
  "memory": {
    "min": 128,
    "max": 128
  },
  "cpu": {
    "min": 100,
    "max": 100
  }
}

const defaultErrorState = {
  "memory": {
    "min": false,
    "max": false
  },
  "cpu": {
    "min": false,
    "max": false
  }
}


const SidebarForm = (props: ISidebarFormProps) => {
  const {
    formSchema,
    formId,
    open,
    onClose,
    title,
    isPieceForm = true
  } = props
  //const [checkboxState, setCheckboxState] = useState<any>({})
  const [formData, setFormData] = useState<any>({})
  const [storageFormData, setStorageFormData] = useState<string>('Read/Write')
  const [containerResourcesFormData, setContainerResourcesFormData] = useState<any>(defaultContainerResources)
  const [containerResourcesFieldsErrors, setContainerResourcesFieldsErrors] = useState<any>(defaultErrorState);
  const [formWidthSpace, setFormWidthSpace] = useState<any>(12)
  const [formJsonSchema, setFormJsonSchema] = useState<any>({ ...formSchema })
  const {
    setFormsForageData,
    fetchForageDataById,
    getForageUpstreamMap,
    setForageUpstreamMap,
    getNameKeyUpstreamArgsMap
  } = useWorkflowsEditor()

  useEffect(() => {
    setFormJsonSchema({ ...formSchema })
  }, [formSchema])

  useEffect(() => {
    setFormWidthSpace(isPieceForm ? 12 : 12)
  }, [isPieceForm])

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
          upstreamMapFormInfo[key] = {
            fromUpstream: fromUpstream,
            upstreamId: upstreamId,
            upstreamArgument: fromUpstream && nameKeyUpstreamArgsMap[data[key]] ? nameKeyUpstreamArgsMap[data[key]] : null,
            value: (data[key] === null || data[key] === undefined) ? null : data[key]
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

  // On Change of storage access mode option
  const handleOnChangeStorage = useCallback(async (event: any) => {
    /*
    // On change update node form data in forage
    // The storage access mode key is inside the node form data in the `storage` key
    {
      ...nodeData,
      storage: {
        storageAccessMode: 'Enum(Read, Write, ReadWrite)'
      }
    }
    */
    if (!event?.target?.value) {
      return
    }
    const data = event.target.value
    const currentData = await fetchForageDataById(formId)
    const storageData = currentData?.storage ? currentData.storage : {}
    storageData['storageAccessMode'] = data
    const outputData = {
      ...currentData,
      storage: storageData
    }
    await setFormsForageData(formId, outputData)
    setStorageFormData(data)
  }, [fetchForageDataById, setFormsForageData, formId])

  // On Change of container resources options
  const handleOnChangeContainerResources = useCallback(async (event: any) => {
    if (!event?.target) {
      return
    }
    const { name, value, type, checked } = event.target;

    var parsedValue = value;
    if (type === 'number') {
      parsedValue = parseInt(value); // Convert the value to a float or use parseInt() for an integer
    }
    var newContainerResourcesData = {}
    var newStorageErrors = {
      ...containerResourcesFieldsErrors
    }
    if (name.includes('.')) {
      const firstLevelKey = name.split('.')[0]
      const secondLevelKey = name.split('.')[1]

      const validationValue: any = storageValidationValues[firstLevelKey]

      if (parsedValue < validationValue.min || parsedValue > validationValue.max) {
        newStorageErrors = {
          ...containerResourcesFieldsErrors,
          [firstLevelKey]: {
            ...containerResourcesFieldsErrors[firstLevelKey],
            [secondLevelKey]: true
          }
        }
      } else {
        newStorageErrors = {
          ...containerResourcesFieldsErrors,
          [firstLevelKey]: {
            ...containerResourcesFieldsErrors[firstLevelKey],
            [secondLevelKey]: false
          }
        }
      }

      newContainerResourcesData = {
        ...containerResourcesFormData,
        [firstLevelKey]: {
          ...containerResourcesFormData[firstLevelKey],
          [secondLevelKey]: type === 'checkbox' ? checked : parsedValue
        }
      }
    } else {
      const firstLevelKey = name
      newContainerResourcesData = {
        ...containerResourcesFormData,
        [firstLevelKey]: type === 'checkbox' ? checked : value
      }
    }

    const currentData = await fetchForageDataById(formId)
    const outputData = {
      ...currentData,
      containerResources: newContainerResourcesData
    }
    await setFormsForageData(formId, outputData)
    setContainerResourcesFormData(newContainerResourcesData)
    setContainerResourcesFieldsErrors(newStorageErrors)
  },
    [
      formId,
      fetchForageDataById,
      setFormsForageData,
      containerResourcesFieldsErrors,
      containerResourcesFormData
    ])

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
      // If the form has checkboxes, we need to update the storage data
      if (!forageData.storage) {
        setStorageFormData("Read/Write")
      } else {
        setStorageFormData(forageData.storage.storageAccessMode)
      }

      if (!forageData.containerResources) {
        setContainerResourcesFormData(defaultContainerResources)
      } else {
        setContainerResourcesFormData(forageData.containerResources)
      }
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
    isPieceForm,
  ])

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
        {
          title ? <Typography variant='h5' component="h5" sx={{ marginTop: '20px', marginBottom: "20px" }}>{title}</Typography > : <br />
        }
        <Grid container>
          {
            isPieceForm ?
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
                  <Grid item xs={formWidthSpace} className='sidebar-jsonforms-grid'>
                    <Grid item xs={12}>
                      <DominoForm
                        formId={formId}
                        schema={formJsonSchema}
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
                        <Grid container spacing={2}>
                          <Grid item xs={12} marginBottom={2}>
                            <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Storage</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>Storage Access Mode</InputLabel>
                              <Select
                                name="storageAccessMode"
                                value={storageFormData}
                                onChange={handleOnChangeStorage}
                                required
                              >
                                <MenuItem value="None">None</MenuItem>
                                <MenuItem value="Read">Read</MenuItem>
                                <MenuItem value="Read/Write">Read/Write</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        <div style={{ marginBottom: '50px' }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12} marginBottom={2}>
                            <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Container Resources</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name={"cpu.min"}
                              label="CPU Min"
                              type="number"
                              value={containerResourcesFormData.cpu.min}
                              onChange={handleOnChangeContainerResources}
                              required
                              fullWidth
                              inputProps={{
                                min: minAcceptedCpu,
                                max: maxAcceptedCpu
                              }}
                              error={containerResourcesFieldsErrors.cpu.min}
                              helperText={containerResourcesFieldsErrors.cpu.min ? 'Min CPU must be between ' + minAcceptedCpu + ' and ' + maxAcceptedCpu : ''}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name={"cpu.max"}
                              label="CPU Max"
                              type="number"
                              value={containerResourcesFormData.cpu.max}
                              onChange={handleOnChangeContainerResources}
                              required
                              fullWidth
                              inputProps={{
                                min: minAcceptedCpu,
                                max: maxAcceptedCpu
                              }}
                              error={containerResourcesFieldsErrors.cpu.max}
                              helperText={containerResourcesFieldsErrors.cpu.max ? 'Max CPU must be between ' + minAcceptedCpu + ' and ' + maxAcceptedCpu : ''}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name={"memory.min"}
                              label="Memory Min"
                              type="number"
                              value={containerResourcesFormData.memory.min}
                              onChange={handleOnChangeContainerResources}
                              required
                              fullWidth
                              inputProps={{
                                min: minAcceptedMemory,
                                max: maxAcceptedMemory
                              }}
                              error={containerResourcesFieldsErrors.memory.min}
                              helperText={containerResourcesFieldsErrors.memory.min ? 'Min Memory must be between ' + minAcceptedMemory + ' and ' + maxAcceptedMemory : ''}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              name={"memory.max"}
                              label="Memory Max"
                              type="number"
                              value={containerResourcesFormData.memory.max}
                              onChange={handleOnChangeContainerResources}
                              required
                              fullWidth
                              inputProps={{
                                min: minAcceptedMemory,
                                max: maxAcceptedMemory
                              }}
                              error={containerResourcesFieldsErrors.memory.max}
                              helperText={containerResourcesFieldsErrors.memory.max ? 'Max Memory must be between ' + minAcceptedMemory + ' and ' + maxAcceptedMemory : ''}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={"useGpu"}
                                  checked={containerResourcesFormData.useGpu}
                                  onChange={handleOnChangeContainerResources}
                                />
                              }
                              label="Use GPU"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </div>
              : null
          }
        </Grid>
        <div style={{ marginBottom: '70px' }} />
      </div>
    </Drawer>
  )
};

export default SidebarForm;