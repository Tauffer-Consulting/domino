import React, { useState } from 'react';
import {
    TextField,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Box,
    FormControl
} from '@mui/material';


interface DominoFormItemProps {
    schema: any;
    itemKey: any;
    value: any;
    onChange: (val: any) => void;
}

const DominoFormItem: React.FC<DominoFormItemProps> = ({ schema, itemKey, value, onChange }) => {
    const [checked, setChecked] = useState(false);

    let itemSchema: any = schema.properties[itemKey];

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        onChange(event.target.value as string);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    let inputElement: JSX.Element;

    // console.log('schema', schema);

    if (checked) {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        inputElement = (
            <Select
                fullWidth
                value={value}
            // onChange={handleSelectChange}
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
            <Select
                fullWidth
                value={value}
            // onChange={handleSelectChange}
            >
                {valuesOptions.map((option: string) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        );
    } else if (itemSchema.type === 'boolean') {
        inputElement = <FormControlLabel
            control={<Checkbox
                checked={value}
                onChange={handleInputChange}
            />}
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
    } else {
        inputElement = (
            <TextField
                fullWidth
                multiline
                variant="outlined"
                label={itemSchema.title}
                // value={value}
                onChange={handleInputChange}
            />
        );
    }

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            {inputElement}
            <Checkbox checked={checked} onChange={handleCheckboxChange} />
        </Box>
    );
};

export default DominoFormItem;
