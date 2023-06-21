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
    } = useWorkflowsEditor();

    // Sub-items schema
    let subItemSchema: any = itemSchema.items;
    if (itemSchema.items?.$ref) {
        const subItemSchemaName = itemSchema.items.$ref.split('/').pop();
        subItemSchema = parentSchemaDefinitions[subItemSchemaName];
    }
    const itemsType = subItemSchema?.type
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

    type ObjectWithBooleanValues = { [key: string]: {[key: string]: boolean} };
    const [checkedFromUpstreamItemProp, setCheckedFromUpstreamItemProp] = useState<ObjectWithBooleanValues[]>(() => {
        if (itemSchema.default && itemSchema.default.length > 0) {
            const initArray = new Array<ObjectWithBooleanValues>(itemSchema.default.length).fill({});
            // set the default values from the schema in cases where from_upstream==="always"
            initArray.map((obj, index) => {
                initArray[index][itemKey] = {}
                Object.keys(arrayOfProperties).map((_key) => {
                    if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                        initArray[index][itemKey][_key] = true;
                    } else {
                        initArray[index][itemKey][_key] = false;
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
        const updatedItems = [...arrayItems];
        updatedItems[index][itemKey] = value;
        onChange(updatedItems);
    }, [onChange, arrayItems]);

    // Add and delete items
    // TODO - fix setArrayItems to fill the props with correct values types, 
    // right now just guessing an empty string, but this will most likely fail e.g. boolen types
    const handleAddItem = useCallback(async() => {
        const newItemDefaultValue: string = ''
        let newItemPropsChecked: ObjectWithBooleanValues = {
            [itemKey]: {}
        };
        Object.keys(arrayOfProperties).map((_key) => {
            if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                newItemPropsChecked[itemKey][_key] = true;
            } else {
                newItemPropsChecked[itemKey][_key] = false;
            }
            return null;
        });
        const upstreamMap = await getForageUpstreamMap()
        const fromUpstream = false
        const upstreamId = null
        const newValue: any = {}
        for (const _key of Object.keys(arrayOfProperties)) {
            newValue[_key] = {
                fromUpstream: fromUpstream,
                upstreamId: upstreamId,
                upstreamArgument: null,
                value: newItemDefaultValue
            }
        }
    
        const newValues = upstreamMap[formId][itemKey].value
        newValues.push(newValue)

        const updatedUpstreaMap = {
            ...upstreamMap,
            [formId]: {
                ...upstreamMap[formId],
                [itemKey]: {
                    fromUpstream: fromUpstream,
                    upstreamId: upstreamId,
                    upstreamArgument: null,
                    value: newValues
                }
            }
        }
        setForageUpstreamMap(updatedUpstreaMap)
        setCheckedFromUpstreamItemProp([...checkedFromUpstreamItemProp, newItemPropsChecked]);
        onChange([...arrayItems, newItemDefaultValue]);
    }, [
        onChange,
        arrayItems,
        checkedFromUpstreamItemProp,
        arrayOfProperties,
        subItemSchema,
        itemKey,
        formId,
        getForageUpstreamMap,
        setForageUpstreamMap
    ]);

    // TODO - this is not working when deleting items with fromUpstrem checked
    const handleDeleteItem = (index: number) => {
        const updatedItems = [...arrayItems];
        updatedItems.splice(index, 1);
        onChange(updatedItems);
        const updatedCheckedFromUpstreamItemProp = [...checkedFromUpstreamItemProp];
        updatedCheckedFromUpstreamItemProp.splice(index, 1);
        setCheckedFromUpstreamItemProp(updatedCheckedFromUpstreamItemProp);
    };



    const _handleCheckboxFromUpstreamChange = useCallback(async (checked: boolean, index: number, checkboxKey: string) => {
        //const checked = event.target.checked;
        setCheckedFromUpstreamItemProp((prevArray) => {
            const newArray = prevArray.map((item, i) => {
                for (const [key, value] of Object.entries(item)) {
                    for (const valueKey of Object.keys(value)) {
                        if (i === index && valueKey === checkboxKey) {
                            return {
                                ...item,
                                [key]: {
                                    ...value,
                                    [valueKey]: checked
                                }
                            };
                        }
                    }
                }
                return item;
            });
            return newArray;
        });

        const edges = await fetchForageWorkflowEdges()
        var auxCheckboxState: any = await getForageCheckboxStates()
        if (!auxCheckboxState) {
            auxCheckboxState = {}
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
                    for (const [key, value] of Object.entries(item)) {
                        for (const valueKey of Object.keys(value)) {
                            if (i === index && valueKey === checkboxKey) {
                                return {
                                    ...item,
                                    [key]: {
                                        ...value,
                                        [valueKey]: false
                                    }
                                };
                            }
                        }
                    }
                    return item;
                });
                return newArray;
            });
            await setForageCheckboxStates(auxCheckboxState)
            toast.error('This piece has no upstreams.')
            return
        }
        

        for (var i=0; i<checkedFromUpstreamItemProp.length; i++){
            if (i === index){
                for (let key of Object.keys(arrayOfProperties)) {
                    auxCheckboxState[formId][itemKey][i][key] = checked
                }
            }
        }

        await setForageCheckboxStates(auxCheckboxState)

        const auxNameKeyUpstreamArgsMap: any = {}
        const auxLabelUpstreamIdMap: any = {}

        var upstreamMap = await getForageUpstreamMap()
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
                        for (const [subItemKey, subItemValue] of Object.entries<any>(subItemSchema.properties)) {
                            if (!(subItemKey in upstreamOptions)) {
                                upstreamOptions[subItemKey] = []
                            }
                            let itemType = subItemValue.format ? subItemValue.format : subItemValue.type
                            if (objType === itemType && checkboxKey === subItemKey){
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
                if (checkboxKey === _key){
                    auxUpstreamValue[_key] = {
                        fromUpstream: checked,
                        value: upstreamValue,
                        upstreamId: valueUpstreamId,
                        upstreamArgument: upstreamArgument
                    }
                }else {
                    auxUpstreamValue[_key] = {
                        ...upstreamMap[formId][itemKey].value[index][_key]
                    }
                }
            }
            upstreamMap[formId][itemKey].value[index] = auxUpstreamValue
        }
        return {
            upstreamOptions,
            upstreamMap
        }
    }, [
        arrayOfProperties,
        subItemSchema.properties,
        getForageUpstreamMap,
        //setForageUpstreamMap,
        fetchForagePieceById,
        fetchForageWorkflowEdges,
        getForageCheckboxStates,
        formId,
        setForageCheckboxStates,
        checkedFromUpstreamItemProp,
        itemKey,
        itemsType
    ]);

    const handleCheckboxFromUpstreamChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, index: number, checkboxKey: string) => {
        const results = await _handleCheckboxFromUpstreamChange(event.target.checked, index, checkboxKey)
        const upstreamOptions = results?.upstreamOptions
        const upstreamMap = results?.upstreamMap
        setUpstreamOptions(upstreamOptions)
        setForageUpstreamMap(upstreamMap)
    }, [_handleCheckboxFromUpstreamChange, setForageUpstreamMap])

    // FromUpstream select logic
    const handleSelectFromUpstreamChange = useCallback((index: number, itemKey: string, value: string) => {
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
            const checkboxStates = await getForageCheckboxStates()

            if ((!(formId in checkboxStates))) {
                checkboxStates[formId] = {}
            }

            if ((!(itemKey in checkboxStates[formId])) || typeof checkboxStates[formId][itemKey] !== 'object') {
                checkboxStates[formId][itemKey] = []
                for (let i = 0; i < arrayItems.length; i++) {
                    const newObj: any = {}
                    for (let key of Object.keys(arrayOfProperties)) {
                        newObj[key] = false
                    }
                    checkboxStates[formId][itemKey].push(newObj)
                }
                setForageCheckboxStates(checkboxStates)
            }
            
            if (!(formId in upstreamMap)) {
                return
            }
            if (!(itemKey in upstreamMap[formId])) {
                return
            }

            var _upstreamOptions = upstreamOptions
            const upstreamMapData = upstreamMap[formId][itemKey].value
            if (typeof upstreamMapData !== 'object') {
                return
            }
            arrayItems.map((item, index) => {
                const value = upstreamMapData[index]
                let itemElements: JSX.Element[] = [];
                // Loop through each of the item's properties and create the inputs for them
                Promise.all(
                    Object.keys(arrayOfProperties).map(async(_itemKey: any, subIndex: any) => {
                        let inputElement: JSX.Element;
                        
                        const subItemPropSchema = arrayOfProperties[_itemKey];
                        const title = subItemPropSchema.title
                        const checkboxFormState = checkboxStates[formId][itemKey]
                        var checkboxValue = false;
                        var isParentChecked = false;
                        if (typeof checkboxFormState === 'boolean'){
                            isParentChecked = true
                        }
                        if (!(typeof checkboxFormState === 'boolean')){
                            checkboxValue = checkboxStates[formId][itemKey][index][_itemKey]
                        }
                        
                        // TODO this can be improved, it is slow but is working for now
                        // upstreamOptionsArray is undefined when user open the form for the first time
                        // it is generated only when user clicks on the checkbox
                        // it will cause a bug if the user close and open the form again since the checkbox will be checked
                        // but the upstreamOptionsArray will be undefined so the form will be rendered as textfield
                        // to solve this maybe we need to generate upstreamOptionsArray when the form is opened for the already checked checkboxes
                        if (upstreamOptions.length === 0 && typeof checkboxFormState !== 'boolean' && checkboxValue) {
                            const results = await _handleCheckboxFromUpstreamChange(checkboxValue, index, _itemKey)
                            _upstreamOptions = results?.upstreamOptions
                            setUpstreamOptions(_upstreamOptions)
                            setForageUpstreamMap(results?.upstreamMap)
                        }
                        var initialValue: any = ''
                        var upstreamOptionsArray: any = []
                        if (!isParentChecked){
                            initialValue = value[_itemKey].value || '';
                            upstreamOptionsArray = _upstreamOptions[_itemKey]
                        }

                        if (!isParentChecked && (upstreamOptionsArray && value[_itemKey].fromUpstream)) {
                            inputElement = (
                                <FormControl fullWidth>
                                    <InputLabel>{`${title} [${index}]`}</InputLabel>
                                    <Select
                                        fullWidth
                                        value={initialValue}
                                        onChange={(e) => handleSelectFromUpstreamChange(index, itemKey, e.target.value)}
                                    >
                                        {upstreamOptionsArray.map((option: string) => (
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
                                    <InputLabel>{`${title} [${index}]`}</InputLabel>
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
                                label={`${title} [${index}]`}
                                value={initialValue}
                                onChange={(e) => handleArrayItemChange(index, itemKey, e.target.value)}
                            />
                        }
                        itemElements.push(
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                {inputElement}
                                {subItemPropSchema?.from_upstream !== "never" ? (
                                    <Checkbox
                                        checked={subItemPropSchema?.from_upstream === 'always' ? true : checkboxValue}
                                        onChange={(event) => handleCheckboxFromUpstreamChange(event, index, _itemKey)}
                                        disabled={subItemPropSchema?.from_upstream === 'never' || subItemPropSchema?.from_upstream === 'always'}
                                    />
                                ) : null}
                            </div>
                        );
                        return null;
                    }));
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
        setForageUpstreamMap,
        _handleCheckboxFromUpstreamChange,
        formId,
        setForageCheckboxStates,
        getForageCheckboxStates,
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