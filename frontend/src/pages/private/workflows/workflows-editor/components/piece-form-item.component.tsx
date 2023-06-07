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
    Grid
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import ArrayInputItem from './piece-form-arrayinput-item.component';
import CodeEditorItem from './piece-form-codeeditor-item.component';


interface PieceFormItemProps {
    formId: string;
    schema: any;
    itemKey: any;
    value: any;
    onChange: (val: any) => void;
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({ formId, schema, itemKey, value, onChange }) => {
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

    var formFieldType = schema.properties[itemKey].type;
    const formFieldFormat = schema.properties[itemKey].format;
    if (formFieldFormat !== undefined && formFieldFormat !== null) {
        formFieldType = formFieldFormat;
    }
    if ('allOf' in schema.properties[itemKey] || "oneOf" in schema.properties[itemKey] || "anyOf" in schema.properties[itemKey]) {
        formFieldType = 'enum'
    }
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

    // The value for this item
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
    const handleInputChange = useCallback((event: any, source: string) => {
        let fieldValue = event?.target?.value || "";
        if (source === 'datePicker' || source === 'dateTimePicker') {
            const newDate = event;
            fieldValue = new Date(newDate).toISOString();
        } else if (source === 'timePicker') {
            const newTime = event;
            fieldValue = dayjs(newTime).format('HH:mm');
        } else if (source === 'codeeditor') {
            fieldValue = event;
        } else if (source === 'array') {
            fieldValue = event;
        } else {
            const { name, value, type, checked } = event.target;
            fieldValue = type === 'checkbox' ? checked : value;
        }
        onChange(fieldValue);
    }, [onChange]);

    const handleSelectChange = useCallback((event: SelectChangeEvent<any>) => {
        onChange(event.target.value as string);
    }, [onChange]);

    const handleCheckboxFromUpstreamChange = useCallback(async (checked: boolean, showWarnings: boolean = true) => {
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

        var upstreamsIds = []
        for (var ed of edges) {
            if (ed.target === formId) {
                upstreamsIds.push(ed.source)
            }
        }
        if (!upstreamsIds.length && showWarnings) {
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
                    var objType = obj.format ? obj.format : obj.type
                    if ('allOf' in obj || "oneOf" in obj || "anyOf" in obj) {
                        objType = 'enum'
                    }

                    if (objType === formFieldType) {
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
        if (checked && !upstreamOptions.length && showWarnings) {
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
                await handleCheckboxFromUpstreamChange(formCheckboxStates[itemKey], false)
            } else {
                await handleCheckboxFromUpstreamChange(false, false)
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
                onChange={(event) => handleInputChange(event, "boolean")}
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
            onChange={(event) => handleInputChange(event, "number")}
        />;
    } else if (itemSchema.type === 'integer') {
        inputElement = <TextField
            fullWidth
            variant="outlined"
            type="number"
            label={itemSchema.title}
            value={value}
            onChange={(event) => handleInputChange(event, "integer")}
        />;
    } else if (itemSchema.type === 'array') {
        inputElement = <ArrayInputItem
            formId={formId}
            itemKey={itemKey}
            itemSchema={itemSchema}
            parentSchemaDefinitions={schema.definitions}
            fromUpstreamMode={arrayItemsFromUpstreamOption}
            arrayItems={value}
            onChange={(event) => handleInputChange(event, "array")}
        />
    } else if (itemSchema.type === 'string' && itemSchema?.format === 'date') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']} sx={{ width: "100%" }}>
                    <DatePicker
                        label={itemSchema.title}
                        views={['day', 'month', 'year']}
                        format="DD/MM/YYYY"
                        sx={{ width: "100%" }}
                        value={dayjs(value)}
                        onChange={(event) => handleInputChange(event, "datePicker")}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.format === 'time') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['TimePicker']} sx={{ width: "100%" }} >
                    <TimePicker
                        ampm={false}
                        label={itemSchema.title}
                        format='HH:mm'
                        sx={{ width: "100%" }}
                        // value={new Date(`1970-01-01T${value}:00`)}  // this trick is necessary to properly parse only time
                        value={dayjs(value, "HH:mm")}
                        onChange={(event) => handleInputChange(event, "timePicker")}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.format === 'datetime') {
        inputElement = (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker']} sx={{ width: "100%" }}>
                    <DateTimePicker
                        ampm={false}
                        label={itemSchema.title}
                        format='DD/MM/YYYY HH:mm'
                        sx={{ width: "100%" }}
                        value={dayjs(value)}
                        onChange={(event) => handleInputChange(event, "dateTimePicker")}
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    } else if (itemSchema.type === 'string' && itemSchema?.widget === 'codeeditor') {
        inputElement = (
            <CodeEditorItem
                itemSchema={itemSchema}
                onChange={(event) => handleInputChange(event, "codeeditor")}
                codeValue={value}
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
                onChange={(event) => handleInputChange(event, "string")}
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
            <Grid item xs={checkedFromUpstreamAllowed ? 10 : 12}>
                {inputElement}
            </Grid>
            {checkedFromUpstreamAllowed ? (
                <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Checkbox
                        checked={checkedFromUpstream}
                        onChange={(event) => handleCheckboxFromUpstreamChange(event.target.checked)}
                        disabled={!checkedFromUpstreamEditable}
                    />
                </Grid>
            ) : null}
        </Box>
    );
};

export default PieceFormItem;
