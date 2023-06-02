import React, { useState, useCallback, useEffect } from 'react';
import {
    TextField,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Box,
    FormControl,
    InputLabel,
    SelectChangeEvent,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { toast } from 'react-toastify';


import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import ArrayInputItem from './domino-form-item-array.component';
import TextCodeItem from './domino-form-item-textcode.component';


interface DominoFormItemProps {
    formId: string;
    schema: any;
    itemKey: any;
    value: any;
    onChange: (val: any) => void;
}

const DominoFormItem: React.FC<DominoFormItemProps> = ({ formId, schema, itemKey, value, onChange }) => {
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
    const formFieldType = schema.properties[itemKey].type;
    const [formLabelUpstreamIdMap, setFormLabelUpstreamIdMap] = useState<Record<string, string>>({});
    const [upstreamOptions, setUpstreamOptions] = useState<string[]>([]);
    const [upstreamSelectValue, setUpstreamSelectValue] = useState<string>('');
    const [checkedFromUpstream, setCheckedFromUpstream] = useState<boolean>(() => {
        if (schema.properties[itemKey]?.from_upstream === "always") {
            if (schema.properties[itemKey].type === 'array') {
                return false;
            }
            return true;
        } else {
            return false;
        }
    });

    // The schema for this item
    let itemSchema: any = schema.properties[itemKey];
    if (value === undefined) {
        value = itemSchema.default;
    }

    // from_upstream condition, if "never" or "always"
    let checkedFromUpstreamAllowed: boolean = true;
    let checkedFromUpstreamEditable: boolean = true;
    let arrayItemsFromUpstreamOption: string = "allowed";
    if (itemSchema?.from_upstream === "never") {
        checkedFromUpstreamAllowed = false;
        checkedFromUpstreamEditable = false;
        if (itemSchema.type === 'array') {
            arrayItemsFromUpstreamOption = "never";
        }
    } else if (itemSchema?.from_upstream === "always") {
        checkedFromUpstreamAllowed = true;
        checkedFromUpstreamEditable = false;
        if (itemSchema.type === 'array') {
            checkedFromUpstreamAllowed = false;
            arrayItemsFromUpstreamOption = "always";
        }
    }

    // Handle input change
    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    }, [onChange]);

    const handleSelectChange = useCallback((event: SelectChangeEvent<any>) => {
        onChange(event.target.value as string);
    }, [onChange]);

    // From upstream checkbox callback
    const handleCheckboxFromUpstreamChange = useCallback(async (checked: boolean) => {
        setCheckedFromUpstream(checked);

        const edges = await fetchForageWorkflowEdges()

        var auxCheckboxState: any = await getForageCheckboxStates()
        if (!auxCheckboxState) {
            auxCheckboxState = {}
        }
        if (formId in auxCheckboxState) {
            auxCheckboxState[formId][itemKey] = checked
        } else {
            auxCheckboxState[formId] = {
                [itemKey]: checked
            }
        }
        await setForageCheckboxStates(auxCheckboxState)

        // We can improve the logic using a forage key with the following structure: 
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
            auxCheckboxState[formId][itemKey] = false
            setCheckedFromUpstream(false);
            await setForageCheckboxStates(auxCheckboxState)
            toast.error('This piece has no upstreams.')
            return
        }

        var upstreamMap = await getForageUpstreamMap()
        if (!(formId in upstreamMap)) {
            upstreamMap[formId] = {}
        }

        const auxNameKeyUpstreamArgsMap: any = {}
        const auxLabelUpstreamIdMap: any = {}
        const upstreamOptions: string[] = []
        for (const upstreamId of upstreamsIds) {
            const upstreamOperatorId = parseInt(upstreamId.split('_')[0])
            var fromUpstream = false
            if (checked) {
                const upstreamOperator = await fetchForagePieceById(upstreamOperatorId)
                const upstreamOutputSchema = upstreamOperator?.output_schema
                Object.keys(upstreamOutputSchema?.properties).forEach((key, index) => {
                    const obj = upstreamOutputSchema?.properties[key]
                    if (obj.type === formFieldType) {
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
            upstreamMap[formId][itemKey] = {
                ...upstreamMap[formId][itemKey],
                fromUpstream: fromUpstream,
                upstreamId: null,
            }
        }
        if (checked && !upstreamOptions.length) {
            auxCheckboxState[formId][itemKey] = false
            setCheckedFromUpstream(false);
            await setForageCheckboxStates(auxCheckboxState)
            toast.error('There are no upstream outputs with the same type as the selected field')
            return
        }

        var upstreamValue = upstreamMap[formId][itemKey].value || ""
        if (!checked) {
            upstreamValue = value
        }
        if (upstreamOptions.length && !upstreamOptions.includes(upstreamValue)) {
            upstreamValue = upstreamOptions[0]
        }
        const upstreamId = upstreamValue && auxLabelUpstreamIdMap[upstreamValue] ?
            auxLabelUpstreamIdMap[upstreamValue] : null
        const upstreamArgument = upstreamValue && auxNameKeyUpstreamArgsMap[upstreamValue]
            ? auxNameKeyUpstreamArgsMap[upstreamValue] : null
        upstreamMap[formId][itemKey] = {
            ...upstreamMap[formId][itemKey],
            upstreamId: upstreamId,
            value: upstreamValue,
            upstreamArgument: upstreamArgument
        }
        setUpstreamOptions(upstreamOptions)
        setFormLabelUpstreamIdMap(auxLabelUpstreamIdMap)
        const currentNameKeyUpstreamArgsMap = await getNameKeyUpstreamArgsMap()
        setNameKeyUpstreamArgsMap({ ...auxNameKeyUpstreamArgsMap, ...currentNameKeyUpstreamArgsMap })
        setForageUpstreamMap(upstreamMap)
        setUpstreamSelectValue(upstreamValue)
    }, [
        value,
        formId,
        itemKey,
        fetchForageWorkflowEdges,
        getForageCheckboxStates,
        setForageCheckboxStates,
        getForageUpstreamMap,
        formFieldType,
        fetchForagePieceById,
        setForageUpstreamMap,
        getNameKeyUpstreamArgsMap,
        setNameKeyUpstreamArgsMap,
    ]);

    // Load checkboxes states from localForage
    useEffect(() => {
        (async () => {
            var auxCheckboxState: any = await getForageCheckboxStates()
            if (!(formId in auxCheckboxState)) {
                return
            }
            const formCheckboxStates = auxCheckboxState[formId]
            if (itemKey in formCheckboxStates) {
                await handleCheckboxFromUpstreamChange(formCheckboxStates[itemKey])
            } else {
                await handleCheckboxFromUpstreamChange(false)
            }
        })()
    }, [getForageCheckboxStates, formId, itemKey, getForageUpstreamMap, handleCheckboxFromUpstreamChange])

    // Select fromUpstream source
    const handleSelectFromUpstreamChange = useCallback(async (event: SelectChangeEvent<any>) => {
        setUpstreamSelectValue(event.target.value as string);
        var upstreamMap = await getForageUpstreamMap()
        const nameKeyUpstreamArgsMap = await getNameKeyUpstreamArgsMap()
        var upstreamMapFormInfo = (formId in upstreamMap) ? upstreamMap[formId] : {}
        const fromUpstream = upstreamMapFormInfo[itemKey] ? upstreamMapFormInfo[itemKey].fromUpstream : false
        const upstreamId = fromUpstream && formLabelUpstreamIdMap[event.target.value as string] ? formLabelUpstreamIdMap[event.target.value as string] : null

        upstreamMapFormInfo[itemKey] = {
            fromUpstream: fromUpstream,
            upstreamId: upstreamId,
            upstreamArgument: fromUpstream && nameKeyUpstreamArgsMap[event.target.value] ? nameKeyUpstreamArgsMap[event.target.value] : null,
            value: (event.target.value === null || event.target.value === undefined) ? null : event.target.value
        }
        upstreamMap[formId] = upstreamMapFormInfo
        await setForageUpstreamMap(upstreamMap)
        onChange(event.target.value);
    }, [
        itemKey,
        getForageUpstreamMap,
        getNameKeyUpstreamArgsMap,
        formId,
        setForageUpstreamMap,
        onChange,
        formLabelUpstreamIdMap

    ]);

    // Set input element based on type
    let inputElement: JSX.Element;
    if (checkedFromUpstream) {
        inputElement = (
            <FormControl fullWidth>
                <InputLabel>{itemSchema?.title}</InputLabel>
                <Select
                    fullWidth
                    value={upstreamSelectValue}
                    onChange={handleSelectFromUpstreamChange}
                >
                    {upstreamOptions.map(option => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    } else if (itemSchema?.allOf && itemSchema.allOf.length > 0) {
        const typeClass = itemSchema.allOf[0]['$ref'].split("/").pop();
        const valuesOptions: Array<string> = schema?.definitions?.[typeClass].enum;
        inputElement = (
            <FormControl fullWidth>
                <InputLabel>{itemKey}</InputLabel>
                <Select
                    value={value}
                    onChange={handleSelectChange}
                >
                    {valuesOptions.map((option: string) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    } else if (itemSchema.type === 'boolean') {
        inputElement = <FormControlLabel
            control={<Checkbox
                checked={value}
                onChange={handleInputChange}
            />}
            labelPlacement="start"
            label={itemSchema.title}
        />;
    } else if (itemSchema.type === 'number') {
        inputElement = <TextField
            fullWidth
            variant="outlined"
            type="number"
            label={itemSchema.title}
            value={value}
            onChange={handleInputChange}
        />;
    } else if (itemSchema.type === 'integer') {
        inputElement = <TextField
            fullWidth
            variant="outlined"
            type="number"
            label={itemSchema.title}
            value={value}
            onChange={handleInputChange}
        />;
    } else if (itemSchema.type === 'array') {
        inputElement = <ArrayInputItem
            itemSchema={itemSchema}
            parentSchemaDefinitions={schema.definitions}
            fromUpstreamMode={arrayItemsFromUpstreamOption}
        />
    } else if (itemSchema.type === 'string' && itemSchema?.widget === 'date') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']} sx={{ width: "100%" }}>
                    <DatePicker
                        label={itemSchema.title}
                        views={['day', 'month', 'year']}
                        format="DD/MM/YYYY"
                        sx={{ width: "100%" }}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.widget === 'time') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['TimePicker']} sx={{ width: "100%" }} >
                    <TimePicker
                        ampm={false}
                        label={itemSchema.title}
                        format='HH:mm'
                        sx={{ width: "100%" }}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.widget === 'datetime') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker']} sx={{ width: "100%" }}>
                    <DateTimePicker
                        ampm={false}
                        label={itemSchema.title}
                        format='DD/MM/YYYY HH:mm'
                        sx={{ width: "100%" }}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.widget === 'codeeditor') {
        inputElement = (
            <TextCodeItem
                itemSchema={itemSchema}
            />
        )
    } else if (itemSchema.type === 'string') {
        inputElement = (
            <TextField
                fullWidth
                multiline
                variant="outlined"
                label={itemSchema.title}
                value={value}
                onChange={handleInputChange}
            />
        );
    } else {
        inputElement = <div style={{ color: "red", fontWeight: "bold" }}>
            Unknown widget type for {itemSchema.title}
        </div>;
    }

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ paddingTop: "10px" }}
        >
            {inputElement}
            {checkedFromUpstreamAllowed ? (
                <Checkbox
                    checked={checkedFromUpstream}
                    onChange={(event) => handleCheckboxFromUpstreamChange(event.target.checked)}
                    disabled={!checkedFromUpstreamEditable}
                />
            ) : null}
        </Box>
    );
};

export default DominoFormItem;
