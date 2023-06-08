import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    IconButton,
    Box,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import { toast } from 'react-toastify';
import { arrayOf } from 'prop-types';

enum FromUpstreamOptions {
    always = "always",
    never = "never",
    allowed = "allowed"
}

// Arrays usually have their inner schema defined in the main schema definitions
interface ArrayInputItemProps {
    formId: string;
    itemKey: string;
    itemSchema: any;
    parentSchemaDefinitions: any;
    fromUpstreamMode?: FromUpstreamOptions | string;
    arrayItems: Array<any> | { [key: string]: any }[];
    onChange: (value: any) => void;
}

const ArrayInputItem: React.FC<ArrayInputItemProps> = ({
    formId,
    itemKey,
    itemSchema,
    parentSchemaDefinitions,
    fromUpstreamMode,
    arrayItems,
    onChange
}) => {

    const {
        fetchForageWorkflowEdges,
        getForageUpstreamMap,
        setForageUpstreamMap,
        fetchForagePieceById,
        getForageCheckboxStates,
        setForageCheckboxStates,
        setNameKeyUpstreamArgsMap,
        getNameKeyUpstreamArgsMap,
    } = useWorkflowsEditor();

    // Sub-items schema
    let subItemSchema: any = itemSchema.items;
    const itemsType = subItemSchema?.type
    if (itemSchema.items?.$ref) {
        const subItemSchemaName = itemSchema.items.$ref.split('/').pop();
        subItemSchema = parentSchemaDefinitions[subItemSchemaName];
    }
    let arrayOfProperties: { [key: string]: any } = useMemo(()=>{return {}},[]);
    // If array subtypes were not defined in the schema, we create a default one
    if (subItemSchema?.properties) {
        arrayOfProperties = subItemSchema?.properties;
    } else {
        arrayOfProperties[itemKey] = {
            "title": itemSchema.title,
            "type": itemsType,
            "description": itemSchema.description,
        };
    }
    const numProps = Object.keys(arrayOfProperties).length;

    const [upstreamOptions, setUpstreamOptions] = useState<string[]>([]);
    const [renderElements, setRenderElements] = useState<any>(null)

    type ObjectWithBooleanValues = { [key: string]: boolean };
    const [checkedFromUpstreamItemProp, setCheckedFromUpstreamItemProp] = useState<ObjectWithBooleanValues[]>(() => {
        if (itemSchema.default && itemSchema.default.length > 0) {
            const initArray = new Array<ObjectWithBooleanValues>(itemSchema.default.length).fill({});
            // set the default values from the schema in cases where from_upstream==="always"
            initArray.map((obj, index) => {
                Object.keys(arrayOfProperties).map(() => {
                    if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                        initArray[index][itemKey] = true;
                    } else {
                        initArray[index][itemKey] = false;
                    }
                    return null;
                });
                return null;
            });
            return initArray;
        }
        return [];

    });

    const handleArrayItemChange = useCallback((index: number, itemKey: string, value: string) => {
        console.log('handleArrayItemChange')
        const updatedItems = [...arrayItems];
        updatedItems[index][itemKey] = value;
        onChange(updatedItems);
    }, [onChange, arrayItems]);

    // Add and delete items
    // TODO - fix setArrayItems to fill the props with correct values types, 
    // right now just guessing an empty string, but this will most likely fail e.g. boolen types
    const handleAddItem = useCallback(() => {
        const newItemPropsValues: string = ''
        let newItemPropsChecked: { [key: string]: boolean } = {};
        Object.keys(arrayOfProperties).map((_itemKey) => {
            if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                newItemPropsChecked[itemKey] = true;
            } else {
                newItemPropsChecked[itemKey] = false;
            }
            return null;
        });
        setCheckedFromUpstreamItemProp([...checkedFromUpstreamItemProp, newItemPropsChecked]);
        onChange([...arrayItems, newItemPropsValues]);
    }, [onChange, arrayItems, checkedFromUpstreamItemProp, arrayOfProperties, subItemSchema, itemKey]);

    // TODO - this is not working when deleting items with fromUpstrem checked
    const handleDeleteItem = (index: number) => {
        const updatedItems = [...arrayItems];
        updatedItems.splice(index, 1);
        onChange(updatedItems);
        const updatedCheckedFromUpstreamItemProp = [...checkedFromUpstreamItemProp];
        updatedCheckedFromUpstreamItemProp.splice(index, 1);
        setCheckedFromUpstreamItemProp(updatedCheckedFromUpstreamItemProp);
    };


    const handleCheckboxFromUpstreamChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        
        const checked = event.target.checked;
        setCheckedFromUpstreamItemProp((prevArray) => {
            const newArray = prevArray.map((item, i) => {
                if (i !== index) {
                    return item;
                }
                return {
                    ...item,
                    [itemKey]: checked
                };
            });
            return newArray;
        });

        const edges = await fetchForageWorkflowEdges()
        var auxCheckboxState: any = await getForageCheckboxStates()
        if (!auxCheckboxState) {
            auxCheckboxState = {}
        }
        
        if ((!(formId in auxCheckboxState))){
            auxCheckboxState[formId] = {}
        }

        if (!(itemKey in auxCheckboxState[formId])){
            if (itemsType === "object") {
                for (let key of Object.keys(subItemSchema?.properties)) {
                    auxCheckboxState[formId][itemKey] = {
                        [key]: new Array(arrayItems.length).fill(false)
                    }
                }
            }else{
                auxCheckboxState[formId][itemKey] = {
                    [itemKey]: new Array(arrayItems.length).fill(false)
                }
            }
        }

        var upstreamsIds = []
        for (var ed of edges) {
            if (ed.target === formId) {
                upstreamsIds.push(ed.source)
            }
        }
        if (!upstreamsIds.length) {
            // set checkbox react states to false
            setCheckedFromUpstreamItemProp((prevArray) => {
                const newArray = prevArray.map((item, i) => {
                    if (i !== index) {
                        return item;
                    }
                    return {
                        ...item,
                        [itemKey]: false
                    };
                });
                return newArray;
            });
            await setForageCheckboxStates(auxCheckboxState)
            toast.error('This piece has no upstreams.')
            return
        }

        for (var i=0; i<checkedFromUpstreamItemProp.length; i++){
            if (i === index){
                for (let key of Object.keys(auxCheckboxState[formId][itemKey])) {
                    auxCheckboxState[formId][itemKey][key][i] = checked
                }
            }else{
                for (let key of Object.keys(auxCheckboxState[formId][itemKey])) {
                    auxCheckboxState[formId][itemKey][key][i] = checkedFromUpstreamItemProp[i][itemKey]
                }
            }
        }
        await setForageCheckboxStates(auxCheckboxState)

        const auxNameKeyUpstreamArgsMap: any = {}
        const auxLabelUpstreamIdMap: any = {}

        var upstreamMap = await getForageUpstreamMap()
        //console.log('upstreamMap', upstreamMap)
        if (!(formId in upstreamMap)) {
            upstreamMap[formId] = {}
        }

        const upstreamOptions: any = {}
        for (const upstreamId of upstreamsIds) {
            const upstreamOperatorId = parseInt(upstreamId.split('_')[0])
            if (checked){
                const upstreamOperator = await fetchForagePieceById(upstreamOperatorId)
                const upstreamOutputSchema = upstreamOperator?.output_schema
                Object.keys(upstreamOutputSchema?.properties).forEach((key, _index) => {
                    const obj = upstreamOutputSchema?.properties[key]
                    var objType = obj.format ? obj.format : obj.type
                    if (itemsType === 'object') {
                        for (const [subItemKey, subItemValuevalue] of Object.entries<any>(subItemSchema.properties)) {
                            if (!(subItemKey in upstreamOptions)) {
                                upstreamOptions[subItemKey] = []
                            }
                            let itemType = subItemValuevalue.format ? subItemValuevalue.format : subItemValuevalue.type
                            if (objType === itemType){
                                let upstreamOptionName = `${upstreamOperator?.name} - ${obj['title']}`
                                let counter = 1;
                                while (upstreamOptions[subItemKey].includes(upstreamOptionName)) {
                                        upstreamOptionName = `${upstreamOptionName} (${counter})`
                                    }
                                upstreamOptions[subItemKey].push(upstreamOptionName)
                                auxNameKeyUpstreamArgsMap[upstreamOptionName] = key
                                auxLabelUpstreamIdMap[upstreamOptionName] = upstreamId
                            }
                        }
                    }

                    if (objType === itemsType){
                        let upstreamOptionName = `${upstreamOperator?.name} - ${obj['title']}`
                        let counter = 1;
                        if (!(itemKey in upstreamOptions)) {
                            upstreamOptions[itemKey] = []
                        }
                        while (upstreamOptions[itemKey].includes(upstreamOptionName)) {
                            upstreamOptionName = `${upstreamOptionName} (${counter})`
                        }
                        upstreamOptions[itemKey].push(upstreamOptionName)
                        auxNameKeyUpstreamArgsMap[upstreamOptionName] = key
                        auxLabelUpstreamIdMap[upstreamOptionName] = upstreamId
                    }
                })
            }

            const auxUpstreamValue: any = {}
            for (let _key of Object.keys(upstreamMap[formId][itemKey].value[index])){
                const upstreamValue = upstreamOptions[_key] ? upstreamOptions[_key][0] : null
                const valueUpstreamId = upstreamValue && auxLabelUpstreamIdMap[upstreamValue] ? auxLabelUpstreamIdMap[upstreamValue] : null
                const upstreamArgument = upstreamValue && auxNameKeyUpstreamArgsMap[upstreamValue] ? auxNameKeyUpstreamArgsMap[upstreamValue] : null
                auxUpstreamValue[_key] = {
                    fromUpstream: checked,
                    value: upstreamValue,
                    upstreamId: valueUpstreamId,
                    upstreamArgument: upstreamArgument
                }
            }
            upstreamMap[formId][itemKey].value[index] = auxUpstreamValue
        }
        setUpstreamOptions(upstreamOptions)
        setForageUpstreamMap(upstreamMap)
    }, [
        subItemSchema.properties,
        getForageUpstreamMap,
        setForageUpstreamMap,
        fetchForagePieceById,
        fetchForageWorkflowEdges,
        getForageCheckboxStates,
        formId,
        setForageCheckboxStates,
        arrayItems,
        checkedFromUpstreamItemProp,
        itemKey,
        itemsType
    ]);

    // FromUpstream select logic
    const handleSelectFromUpstreamChange = useCallback((index: number, itemKey: string, value: string) => {
        console.log('handleSelectFromUpstreamChange')
        const updatedItems = [...arrayItems];
        if (typeof updatedItems[index] === 'object') {
            updatedItems[index][itemKey] = value;
        } else {
            updatedItems[index] = value;
        }
        // setArrayItems(updatedItems);
    }, [arrayItems]);


    useEffect(() => {
        (async () => {
            const newElements: any  = {}
            const upstreamMap = await getForageUpstreamMap()
            
            if (!(formId in upstreamMap)) {
                return
            }
            if (!(itemKey in upstreamMap[formId])) {
                return
            }
            
            const upstreamMapData = upstreamMap[formId][itemKey].value

            for (const i in upstreamMapData){
                const value = upstreamMapData[i]
                var index = 0;
                const entries: [any, any][] = Object.entries(value);
                //for (let [key, _value] of Object.entries<{ value: string, upstreamId: string, upstreamArgument: string, fromUpstream: boolean }>(value)) {
                for (let [key, _value] of entries) {
                    const formValue: string = _value.value
                    const upstreamId: string = _value.upstreamId
                    const upstreamArgument: string = _value.upstreamArgument
                    const fromUpstream: boolean = _value.fromUpstream     
                    const title = arrayOfProperties[key].title
                
                    const upstreamOptionsArray: any = upstreamOptions[key]
                    var inputElement = null
                    if (fromUpstream){
                        inputElement = (
                            <FormControl fullWidth>
                                <InputLabel>{`${title} [${index}]`}</InputLabel>
                                <Select
                                    fullWidth
                                    value={formValue}
                                    //onChange={(e) => handleSelectFromUpstreamChange(index, itemKey, e.target.value)}
                                >
                                    {
                                        upstreamOptionsArray.map((option: string) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        );
                    }
                    index = index + 1
                }

            }
            

            arrayItems.map((item, index) => {
                let itemElements: JSX.Element[] = [];
                // Loop through each of the item's properties and create the inputs for them
                Object.keys(arrayOfProperties).map((_itemKey, subIndex) => {
                    let inputElement: JSX.Element;
                    const subItemPropSchema = arrayOfProperties[_itemKey];
                    let initialValue: any = '';
                    if (typeof arrayItems[index] === 'object') {
                        initialValue = arrayItems[index as number][_itemKey as keyof typeof arrayItems[number]];
                    } else {
                        initialValue = arrayItems[index as number];
                    }
                    if (checkedFromUpstreamItemProp[index]?.[itemKey]) {
                        //inputElement = (<h1>hello</h1>)
                        inputElement = (
                            <FormControl fullWidth>
                                <InputLabel>{`${_itemKey} [${index}]`}</InputLabel>
                                <Select
                                    fullWidth
                                    value={initialValue}
                                    onChange={(e) => handleSelectFromUpstreamChange(index, itemKey, e.target.value)}
                                >
                                    {/* {upstreamOptions[itemKey].map((option: string) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))} */}
                                </Select>
                            </FormControl>
                        );
                    } else if (subItemPropSchema?.allOf && subItemPropSchema.allOf.length > 0) {
                        const typeClass = subItemPropSchema.allOf[0]['$ref'].split("/").pop();
                        const valuesOptions: Array<string> = parentSchemaDefinitions?.[typeClass].enum;
                        inputElement = (
                            <FormControl fullWidth>
                                <InputLabel>{`${itemKey} [${index}]`}</InputLabel>
                                <Select
                                    value={initialValue}
                                    onChange={(e) => handleArrayItemChange(index, itemKey, e.target.value)}
                                >
                                    {valuesOptions.map((option: string) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        );
                    } else {
                        inputElement = <TextField
                            fullWidth
                            label={`${itemKey} [${index}]`}
                            value={initialValue}
                            onChange={(e) => handleArrayItemChange(index, itemKey, e.target.value)}
                        />
                    }
                    itemElements.push(
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            {inputElement}
                            {subItemPropSchema?.from_upstream !== "never" ? (
                                <Checkbox
                                    checked={subItemPropSchema?.from_upstream === 'always' ? true : checkedFromUpstreamItemProp[index]?.[itemKey]}
                                    onChange={(event) => handleCheckboxFromUpstreamChange(event, index)}
                                    disabled={subItemPropSchema?.from_upstream === 'never' || subItemPropSchema?.from_upstream === 'always'}
                                />
                            ) : null}
                        </div>
                    );
                    return null;
                });
                newElements[index] = ( <div
                    style={{
                        display: 'flex',
                        flexDirection: fromUpstreamMode === 'never' && numProps < 3 ? 'row' : 'column',
                        width: '100%'
                    }}
                >
                    {itemElements}
                </div>)
                return null;
            })
            setRenderElements(newElements)
        })()
    }, [
        formId,
        getForageUpstreamMap,
        arrayOfProperties,
        arrayItems,
        checkedFromUpstreamItemProp,
        fromUpstreamMode,
        handleArrayItemChange,
        handleCheckboxFromUpstreamChange,
        itemKey,
        numProps,
        parentSchemaDefinitions,
        upstreamOptions,
        handleSelectFromUpstreamChange,
    ])

    return (
        <Card sx={{ width: "100%", paddingTop: 0 }}>
            <div>
                <IconButton onClick={handleAddItem} aria-label="Add" sx={{ paddingRight: "16px" }}>
                    <AddIcon />
                </IconButton>
                {itemSchema.title}
            </div>
            <CardContent>
                {arrayItems.map((item, index) => (
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            mb: 1,
                            borderLeft: "solid 1px rgba(0,0,0,0.8)",
                            borderRadius: "6px",
                        }}
                    >
                        <IconButton onClick={() => handleDeleteItem(index)} aria-label="Delete">
                            <DeleteIcon />
                        </IconButton>
                        {renderElements ? renderElements[index] : ''}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

export default React.memo(ArrayInputItem);