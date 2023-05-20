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
    Card, CardContent, CardHeader, IconButton
} from '@mui/material';
import Delete from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';

import ArrayInputCard from './domino-form-item-array.component';


interface DominoFormItemProps {
    schema: any;
    itemKey: any;
    value: any;
    onChange: (val: any) => void;
}

const DominoFormItem: React.FC<DominoFormItemProps> = ({ schema, itemKey, value, onChange }) => {
    const [checkedFromUpstream, setCheckedFromUpstream] = useState(false);

    // console.log(itemKey);
    // console.log(value)

    let itemSchema: any = schema.properties[itemKey];

    // if value is undefined, read the defautl value from the schema
    if (value === undefined) {
        value = itemSchema.default;
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
        inputElement = <ArrayInputCard title="Array Input Example" />
    } else {
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
    }

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ paddingTop: "10px" }}
        >
            {inputElement}
            <Checkbox checked={checkedFromUpstream} onChange={handleCheckboxFromUpstreamChange} />
        </Box>
    );
};

export default DominoFormItem;
