import { createAjv } from '@jsonforms/core'
import { Drawer, Grid, Checkbox, FormGroup, FormControlLabel, Typography } from '@mui/material'
import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { extractDefaultValues } from 'utils'
import { operatorStorageSchema } from 'common/schemas/storageSchemas'
import { containerResourcesSchema } from 'common/schemas/containerResourcesSchemas'
import { toast } from 'react-toastify'

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
    uiSchema,
    //formData,
    formId,
    open,
    onClose,
    title,
    isPieceForm = true
  } = props

  //const [checkboxState, setCheckboxState] = useState<any>({})
  const [formData, setFormData] = useState<any>({})
  const [storageFormData, setStorageFormData] = useState<any>({})
  const [containerResourcesFormData, setContainerResourcesFormData] = useState<any>({})
  const [checkboxes, setCheckboxes] = useState<any>([])
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

  const handleOnChangeStorage = useCallback(async ({ errors, data }: { errors?: any, data: any }) => {
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
    const currentData = await fetchForageDataById(formId)
    const storageData = currentData?.storage ? currentData.storage : {}
    storageData['storageAccessMode'] = data.storageAccessMode
    const outputData = {
      ...currentData,
      storage: storageData
    }
    await setFormsForageData(formId, outputData)
    setStorageFormData(data)

  }, [fetchForageDataById, setFormsForageData, formId])

  const handleOnChangeContainerResources = useCallback(async ({ errors, data }: { errors?: any, data: any }) => {
    const currentData = await fetchForageDataById(formId)
    const outputData = {
      ...currentData,
      containerResources: data
    }
    await setFormsForageData(formId, outputData)
    setContainerResourcesFormData(data)
  }, [formId, fetchForageDataById, setFormsForageData])

  useEffect(() => {
    // When opened fetch forage data and update forms data
    const fetchForage = async () => {
      const forageData = await fetchForageDataById(formId)
      if (!forageData) {
        const defaultData = extractDefaultValues(formJsonSchema)
        handleOnChange({ data: defaultData })
        const defaultStorageData = extractDefaultValues(operatorStorageSchema)
        isPieceForm && handleOnChangeStorage({ data: defaultStorageData })
        setFormData(defaultData)
      } else {
        handleOnChange({ data: forageData })
        // If the form has checkboxes, we need to update the storage data
        if (isPieceForm && !forageData.storage) {
          const defaultStorageData = extractDefaultValues(operatorStorageSchema)
          handleOnChangeStorage({ data: defaultStorageData })
        } else if (isPieceForm) {
          handleOnChangeStorage({ data: forageData.storage })
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
          <Grid container sx={{ paddingBottom: "25px" }}>
            <Grid item xs={formWidthSpace} className='sidebar-jsonforms-grid'>
              <DominoForm
                formId={formId}
                schema={formJsonSchema}
                initialData={formData}
                onChange={handleOnChange}
              />
              {/* <JsonForms
                schema={formJsonSchema}
                uischema={uiSchema || undefined}
                data={formData}
                renderers={materialRenderers}
                onChange={handleOnChange}
                ajv={handleDefaultsAjv}
                cells={materialCells}
              /> */}
            </Grid>
            {/* {
              isPieceForm ?
                <Grid item xs={3}>
                  <FormGroup sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
                    {checkboxes}
                  </FormGroup>
                </Grid> : null
            } */}
          </Grid>
          {
            isPieceForm ?
              <Grid container spacing={0}>
                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid", marginBottom: '20px', marginTop: '20px' }}>Storage</Typography>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingBottom: '25px' }} className='sidebar-jsonforms-grid'>
                  <JsonForms
                    data={storageFormData}
                    onChange={handleOnChangeStorage}
                    schema={operatorStorageSchema}
                    renderers={materialRenderers}
                    ajv={handleDefaultsAjv}
                    cells={materialCells}
                  />
                </div>

                <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid", marginBottom: '20px', marginTop: '20px' }}>ADVANCED - Container resources</Typography>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }} className='sidebar-jsonforms-grid'>
                  <JsonForms
                    data={containerResourcesFormData}
                    onChange={handleOnChangeContainerResources}
                    schema={containerResourcesSchema}
                    renderers={materialRenderers}
                    ajv={handleDefaultsAjv}
                    cells={materialCells}
                  />
                </div>
              </Grid>
              : null
          }

        </Grid>
      </div>
    </Drawer>
  )
}
export default SidebarForm
