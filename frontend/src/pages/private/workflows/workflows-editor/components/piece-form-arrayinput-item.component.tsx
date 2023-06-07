import React, { useState, useCallback, useMemo } from 'react';
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
    if (itemSchema.items?.$ref) {
        const subItemSchemaName = itemSchema.items.$ref.split('/').pop();
        subItemSchema = parentSchemaDefinitions[subItemSchemaName];
    }
    let arrayOfProperties: { [key: string]: any } = useMemo(()=>{return {}},[]);
    // If array subtypes were not defined in the schema, we create a default one
    if (subItemSchema?.properties) {
        arrayOfProperties = subItemSchema?.properties;
    } else {
        arrayOfProperties[itemSchema.title] = { "": "" };
    }
    const numProps = Object.keys(arrayOfProperties).length;
    const itemsType = subItemSchema?.type
    const [upstreamOptions, setUpstreamOptions] = useState<string[]>([]);


    // console.log("itemSchema", itemSchema);
    // console.log("subItemSchema", subItemSchema);
    // console.log("parentSchemaDefinitions", parentSchemaDefinitions);

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

    const handleArrayItemChange = (index: number, itemKey: string, value: string) => {
        console.log('handleArrayItemChange')
        const updatedItems = [...arrayItems];
        updatedItems[index][itemKey] = value;
        onChange(updatedItems);
    };

    // Add and delete items
    // TODO - fix setArrayItems to fill the props with correct values types, 
    // right now just guessing an empty string, but this will most likely fail e.g. boolen types
    const handleAddItem = () => {
        let newItemPropsValues: { [key: string]: any } = {};
        let newItemPropsChecked: { [key: string]: boolean } = {};
        Object.keys(arrayOfProperties).map((itemKey) => {
            if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                newItemPropsChecked[itemKey] = true;
                newItemPropsValues[itemKey] = '';
            } else {
                newItemPropsChecked[itemKey] = false;
                newItemPropsValues[itemKey] = '';
            }
            return null;
        });
        setCheckedFromUpstreamItemProp([...checkedFromUpstreamItemProp, newItemPropsChecked]);
        onChange([...arrayItems, newItemPropsValues]);
    };

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
            auxCheckboxState[formId] = {
                [itemKey]: new Array(arrayItems.length).fill(false)
            }
        } else if (typeof auxCheckboxState[formId][itemKey] !== 'object') {
            auxCheckboxState[formId][itemKey] = new Array(arrayItems.length).fill(false)
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
                auxCheckboxState[formId][itemKey][i] = checked
            }else{
                auxCheckboxState[formId][itemKey][i] = checkedFromUpstreamItemProp[i][itemKey]
            }
        }
        await setForageCheckboxStates(auxCheckboxState)

        const auxNameKeyUpstreamArgsMap: any = {}
        const auxLabelUpstreamIdMap: any = {}
        const upstreamOptions: string[] = []

        var upstreamMap = await getForageUpstreamMap()
        if (!(formId in upstreamMap)) {
            upstreamMap[formId] = {}
        }

        for (const upstreamId of upstreamsIds) {
            const upstreamOperatorId = parseInt(upstreamId.split('_')[0])
            var fromUpstream = false
            if (checked){
                const upstreamOperator = await fetchForagePieceById(upstreamOperatorId)
                const upstreamOutputSchema = upstreamOperator?.output_schema
                Object.keys(upstreamOutputSchema?.properties).forEach((key, index) => {
                    const obj = upstreamOutputSchema?.properties[key]
                    var objType = obj.format ? obj.format : obj.type
                    if (objType === itemsType) {
                        var upstreamOptionName = `${upstreamOperator?.name} - ${obj['title']}`
                        const counter = 1;
                        while (upstreamOptions.includes(upstreamOptionName)) {
                            upstreamOptionName = `${upstreamOptionName} (${counter})`
                        }
                        upstreamOptions.push(upstreamOptionName)
                        auxNameKeyUpstreamArgsMap[upstreamOptionName] = key
                        auxLabelUpstreamIdMap[upstreamOptionName] = upstreamId
                    }
                })
                fromUpstream = true
            }
            // TODO fix
            upstreamMap[formId][itemKey] = {
                ...upstreamMap[formId][itemKey],
                fromUpstream: fromUpstream,
                upstreamId: null,
            }
        }


    }, [
        getForageUpstreamMap,
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
    const handleSelectFromUpstreamChange = (index: number, itemKey: string, value: string) => {
        console.log('handleSelectFromUpstreamChange')
        const updatedItems = [...arrayItems];
        if (typeof updatedItems[index] === 'object') {
            updatedItems[index][itemKey] = value;
        } else {
            updatedItems[index] = value;
        }
        // setArrayItems(updatedItems);
    };

    // Each item in the array can be multiple inputs, with varied types like text, select, checkbox, etc.
    const createItemElements = useCallback((item: string, index: number) => {
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
                inputElement = (
                    <FormControl fullWidth>
                        <InputLabel>{`${_itemKey} [${index}]`}</InputLabel>
                        <Select
                            fullWidth
                            value={initialValue}
                            onChange={(e) => handleSelectFromUpstreamChange(index, itemKey, e.target.value)}
                        >
                            {upstreamOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
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
        return <div
            style={{
                display: 'flex',
                flexDirection: fromUpstreamMode === 'never' && numProps < 3 ? 'row' : 'column',
                width: '100%'
            }}
        >
            {itemElements}
        </div>
    }, [
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
        handleSelectFromUpstreamChange
    ]);

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
                        {createItemElements(item, index)}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

export default React.memo(ArrayInputItem);