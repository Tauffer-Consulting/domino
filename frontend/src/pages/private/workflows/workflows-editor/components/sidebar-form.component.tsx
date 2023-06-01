import { createAjv } from '@jsonforms/core'
import { 
  Divider,
  Drawer,
  Grid, 
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel
 } from '@mui/material'
//import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
//import { JsonForms } from '@jsonforms/react'
import { useCallback, useEffect, useState } from 'react'
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { extractDefaultValues } from 'utils'
import { operatorStorageSchema } from 'common/schemas/storageSchemas'
import { containerResourcesSchema } from 'common/schemas/containerResourcesSchemas'
import { workflowFormSchema } from 'common/schemas/workflowFormSchema'

import DominoForm from './domino-form.component'


const handleDefaultsAjv = createAjv({ useDefaults: true })

interface ISidebarFormProps {
  formSchema: any,
  uiSchema?: any,
  formId: string,
  open: boolean,
  onClose: (event: any) => void,
  title?: string,
  isPieceForm?: boolean,
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
  const [storageFormData, setStorageFormData] = useState<string>('None')
  const [containerResourcesFormData, setContainerResourcesFormData] = useState<any>({})
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


  const handleOnChange = useCallback(async ({ errors, data }: { errors?: any, data: any }) => {
    // On change update form data in forage
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

  const handleOnChangeContainerResources = useCallback(async ({ errors, data }: { errors?: any, data: any }) => {
    // const currentData = await fetchForageDataById(formId)
    // const outputData = {
    //   ...currentData,
    //   containerResources: data
    // }
    // await setFormsForageData(formId, outputData)
    // setContainerResourcesFormData(data)
  }, [formId, fetchForageDataById, setFormsForageData])

  

  useEffect(() => {
    // When opened fetch forage data and update forms data
    const fetchForage = async () => {
      const forageData = await fetchForageDataById(formId)
      
      if (!forageData) {
        const defaultData = extractDefaultValues(formJsonSchema)
        handleOnChange({ data: defaultData })
        isPieceForm && handleOnChangeStorage({ data: "None" })
        setFormData(defaultData)
      } else {
        handleOnChange({ data: forageData })
        // If the form has checkboxes, we need to update the storage data
        if (isPieceForm && !forageData.storage) {
          handleOnChangeStorage({ data: "None" })
          setStorageFormData("None")
        } else if (isPieceForm) {
          handleOnChangeStorage({ data: forageData.storage })
          setStorageFormData(forageData.storage.storageAccessMode)
        }

        if (isPieceForm && !forageData.containerResources) {
          const defaultContainerResourcesData = extractDefaultValues(containerResourcesSchema)
          handleOnChangeContainerResources({ data: defaultContainerResourcesData })
        } else if (isPieceForm) {
          handleOnChangeContainerResources({ data: forageData.containerResources })
        }
        setFormData(forageData)
      }
    }
    if (open) { fetchForage() }

  }, [formId, formJsonSchema, open, fetchForageDataById, setFormsForageData, handleOnChange, handleOnChangeStorage, isPieceForm, handleOnChangeContainerResources])
  
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
              <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
                <Grid item xs={10}>
                  <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Input Argument</Typography>
                </Grid>
                <Grid item xs={12 - 10}>
                  <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Upstream</Typography>
                </Grid>
              </Grid>
              : null
          }
          {
            isPieceForm ?
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
                  <Divider sx={{ marginTop: '20px', marginBottom: '25px' }} />
                  <Grid item xs={12}>
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
              </Grid>
            </Grid>
            : null
          }
        </Grid>
      </div>
    </Drawer>
  )
}
export default SidebarForm
