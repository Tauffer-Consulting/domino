import React, { useState } from 'react';
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
import CodeEditor from '@uiw/react-textarea-code-editor';

import ArrayInputItem from './domino-form-item-array.component';


interface DominoFormItemProps {
    schema: any;
    itemKey: any;
    value: any;
    onChange: (val: any) => void;
}

const DominoFormItem: React.FC<DominoFormItemProps> = ({ schema, itemKey, value, onChange }) => {
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
    const [codeValue, setCodeValue] = useState(() => {
        if (schema.properties[itemKey]?.default) {
            return schema.properties[itemKey].default;
        } else {
            return `# Do not modify the function definition line 
def custom_function(input_args: list):
    # Write your code here
    print(input_args)

    # Return the output of the function as an object
    return {
        "out_arg_1": "out_value_1", 
        "out_arg_2": "out_value_2"
    }`;
        }
    });

    // console.log(itemKey);
    // console.log(value)

    let itemSchema: any = schema.properties[itemKey];

    // if value is undefined, read the defautl value from the schema
    if (value === undefined) {
        value = itemSchema.default;
    }

    // from upstream condition, if "never" or "always"
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
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    const handleSelectChange = (event: SelectChangeEvent<any>) => {
        onChange(event.target.value as string);
    };

    // FomrUpstream logic
    const handleCheckboxFromUpstreamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedFromUpstream(event.target.checked);
    };

    const handleSelectFromUpstreamChange = (event: SelectChangeEvent<any>) => {
        console.log(event.target.value);
    };

    let inputElement: JSX.Element;

    if (checkedFromUpstream) {
        const options = ['upstream 1', 'upstream 2', 'upstream 3', 'upstream 4'];
        inputElement = (
            <FormControl fullWidth>
                <InputLabel>{itemKey}</InputLabel>
                <Select
                    fullWidth
                    value={value}
                    onChange={handleSelectFromUpstreamChange}
                >
                    {options.map(option => (
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
            <CodeEditor
                value={codeValue}
                language="python"
                placeholder="Enter Python code."
                onChange={(evn: any) => setCodeValue(evn.target.value)}
                padding={15}
                style={{
                    fontSize: 12,
                    backgroundColor: "#f5f5f5",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    width: "100%",
                    minHeight: "200px",
                    maxHeight: "400px",
                    overflowY: "scroll",
                }}
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
                    onChange={handleCheckboxFromUpstreamChange}
                    disabled={!checkedFromUpstreamEditable}
                />
            ) : null}
        </Box>
    );
};

export default DominoFormItem;
