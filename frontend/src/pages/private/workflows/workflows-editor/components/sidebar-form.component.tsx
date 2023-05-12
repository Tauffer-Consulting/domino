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

const handleDefaultsAjv = createAjv({ useDefaults: true })

interface ISidebarFormProps {
  formSchema: any,
  uiSchema?: any,
  formId: string,
  open: boolean,
  onClose: (event: any) => void,
  title?: string,
  renderCheckboxes?: boolean,
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
    renderCheckboxes = true
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
    fetchForageWorkflowEdges,
    getForageUpstreamMap,
    setForageUpstreamMap,
    fetchForageOperatorById,
    getForageCheckboxStates,
    setForageCheckboxStates,
    setNameKeyUpstreamArgsMap,
    getNameKeyUpstreamArgsMap,
  } = useWorkflowsEditor()

  useEffect(() => {
    setFormJsonSchema({ ...formSchema })
  }, [formSchema])

  useEffect(() => {
    setFormWidthSpace(renderCheckboxes ? 9 : 12)
  }, [renderCheckboxes])


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
            value: data[key] ? data[key] : null
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
        renderCheckboxes && handleOnChangeStorage({ data: defaultStorageData })
        setFormData(defaultData)
      } else {
        handleOnChange({ data: forageData })
        // If the form has checkboxes, we need to update the storage data
        if (renderCheckboxes && !forageData.storage) {
          const defaultStorageData = extractDefaultValues(operatorStorageSchema)
          handleOnChangeStorage({ data: defaultStorageData })
        } else if (renderCheckboxes) {
          handleOnChangeStorage({ data: forageData.storage })
        }

        if (renderCheckboxes && !forageData.containerResources) {
          const defaultContainerResourcesData = extractDefaultValues(containerResourcesSchema)
          handleOnChangeContainerResources({ data: defaultContainerResourcesData })
        } else if (renderCheckboxes) {
          handleOnChangeContainerResources({ data: forageData.containerResources })
        }
        setFormData(forageData)
      }
    }
    if (open) { fetchForage() }

  }, [formId, formJsonSchema, open, fetchForageDataById, setFormsForageData, handleOnChange, handleOnChangeStorage, renderCheckboxes, handleOnChangeContainerResources])


  const handleCheckbox = useCallback(async (e: any) => {
    var auxSchema = JSON.parse(JSON.stringify(formJsonSchema))
    var formKeys = Object.keys(formJsonSchema.properties)
    const edges = await fetchForageWorkflowEdges()

    // Save checkbox state to use when closing/opening the drawer
    var auxCheckboxState: any = await getForageCheckboxStates()
    if (!auxCheckboxState) {
      auxCheckboxState = {}
    }

    var auxFormData = formData ? JSON.parse(JSON.stringify(formData)) : {}
    if (formId in auxCheckboxState) {
      auxCheckboxState[formId][e.target.value] = e.target.checked
    } else {
      auxCheckboxState[formId] = {
        [e.target.value]: e.target.checked
      }
    }

    await setForageCheckboxStates(auxCheckboxState)
    //setCheckboxState(auxCheckboxState)

    // We can improve the logic using a forage key using following structure: 
    // nodeId: {
    //   upstreams: [],
    //   downstreams: [],
    // }
    // It will avoid to iterate over all edges
    var upstreamsIds = []
    for (var ed of edges) {
      if (ed.target === formId) {
        upstreamsIds.push(ed.source)
      }
    }

    if (!upstreamsIds.length) {
      return
    }

    var upstreamMap = await getForageUpstreamMap()
    if (!(formId in upstreamMap)) {
      upstreamMap[formId] = {}
    }

    const auxNameKeyUpstreamArgsMap: any = {}
    for (let i = 0; i < formKeys.length; i++) {
      if (formKeys[i] === e.target.value) {
        const fieldType = formJsonSchema.properties[formKeys[i]].type
        var dropdownSchema: any = {
          type: fieldType
        }
        const enums: any = []
        for (var upstreamId of upstreamsIds) {
          const upstreamOperatorId = parseInt(upstreamId.split('_')[0])
          if (e.target.checked) {
            // If checked add dropdown options from upstreams
            const upstreamOperator = await fetchForageOperatorById(upstreamOperatorId)
            const outputSchema = upstreamOperator?.output_schema
            Object.keys(outputSchema?.properties).forEach((key, index) => {
              const obj = outputSchema?.properties[key]
              if (obj.type === fieldType) {
                enums.push(
                  `${upstreamOperator?.name} - ${obj['title']}`
                )
                // TODO - improve this because it doesn't accept duplicated upstream nodes
                auxNameKeyUpstreamArgsMap[`${upstreamOperator?.name} - ${obj['title']}`] = key
              }
            });
            // Set upstream map to operator if using upstream
            upstreamMap[formId][e.target.value] = {
              fromUpstream: true,
              upstreamId: upstreamId,
              upstreamArgument: null
            }

          } else {
            // If unchecked remove dropdown options from upstreams and use operator inputs schemas
            const operatorId = parseInt(formId.split('_')[0])
            const operator = await fetchForageOperatorById(operatorId)
            const inputSchema = operator?.input_schema
            auxSchema.properties[formKeys[i]] = inputSchema?.properties[formKeys[i]]
            auxFormData[formKeys[i]] = inputSchema?.properties[formKeys[i]].default
            upstreamMap[formId][e.target.value] = {
              fromUpstream: false,
              upstreamId: upstreamId,
              upstreamArgument: null
            }
          }
        }
        if (e.target.checked) {
          dropdownSchema['enum'] = enums
          dropdownSchema['default'] = enums[0]
          auxSchema.properties[formKeys[i]] = dropdownSchema
          auxFormData[formKeys[i]] = dropdownSchema.default
        }
      }
    }
    const currentNameKeyUpstreamArgsMap = await getNameKeyUpstreamArgsMap()
    setNameKeyUpstreamArgsMap({ ...auxNameKeyUpstreamArgsMap, ...currentNameKeyUpstreamArgsMap })
    setForageUpstreamMap(upstreamMap)
    setFormJsonSchema(auxSchema)
    setFormData(auxFormData)

  },
    [
      formJsonSchema,
      formId,
      fetchForageWorkflowEdges,
      fetchForageOperatorById,
      setForageUpstreamMap,
      getForageUpstreamMap,
      formData,
      getForageCheckboxStates,
      setForageCheckboxStates,
      setNameKeyUpstreamArgsMap,
      getNameKeyUpstreamArgsMap
    ])

  useEffect(() => {
    // This is a hack because customizing jsonforms ui for accepting multi column would be harder than create a custom checkbox column
    // When form schema changes, update checkboxes
    const loadCheckboxes = async () => {
      var auxCheckboxes: any = []
      var forageCheckboxState: any = await getForageCheckboxStates()
      for (const key in formJsonSchema?.properties) {
        var checked = false
        if (formId in forageCheckboxState) {
          checked = forageCheckboxState[formId][key]
        }
        const newCheckbox = checked ? <FormControlLabel sx={{ justifyContent: 'center' }} key={uuidv4()} control={<Checkbox onChange={handleCheckbox} value={key} defaultChecked />} label="" /> : <FormControlLabel key={uuidv4()} sx={{ justifyContent: 'center' }} control={<Checkbox onChange={handleCheckbox} value={key} />} label="" />
        auxCheckboxes.push(newCheckbox)
      }
      setCheckboxes(auxCheckboxes)
    }
    if (formJsonSchema) {
      loadCheckboxes()
    }
  }, [formJsonSchema, handleCheckbox, formId, getForageCheckboxStates])

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
            renderCheckboxes ?
              <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
                <Grid item xs={formWidthSpace}>
                  <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Input Argument</Typography>
                </Grid>
                <Grid item xs={12 - formWidthSpace}>
                  <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Upstream</Typography>
                </Grid>
              </Grid>
              : null
          }
          <Grid container sx={{ paddingBottom: "25px" }}>
            <Grid item xs={formWidthSpace} className='sidebar-jsonforms-grid'>
              <JsonForms
                schema={formJsonSchema}
                uischema={uiSchema || undefined}
                data={formData}
                renderers={materialRenderers}
                onChange={handleOnChange}
                ajv={handleDefaultsAjv}
                cells={materialCells}
              />
            </Grid>
            {
              renderCheckboxes ?
                <Grid item xs={3}>
                  <FormGroup sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
                    {checkboxes}
                  </FormGroup>
                </Grid> : null
            }
          </Grid>
          {
            renderCheckboxes ?
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
