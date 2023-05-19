import React, { useState } from 'react';
import { TextField, Select, MenuItem, Checkbox, FormControlLabel, Box } from '@mui/material';


interface DominoFormItemProps {
    schema: any;
    key: string;
    value: any;
    onChange: (val: any) => void;
}

const DominoFormItem: React.FC<DominoFormItemProps> = ({ schema, key, value, onChange }) => {
    const [checked, setChecked] = useState(false);

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
    } else if (schema.enum) {
        inputElement = (
            <Select
                value={value}
            // onChange={handleSelectChange}
            >
                {schema.enum.map((option: string) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        );
    } else if (schema.type === 'boolean') {
        inputElement = <FormControlLabel control={<Checkbox checked={value} onChange={handleInputChange} />} label="" />;
    } else if (schema.type === 'number') {
        inputElement = <TextField type="number" value={value} onChange={handleInputChange} />;
    } else {
        inputElement = <TextField
            fullWidth
            id="outlined-basic"
            variant="outlined"
            label={key}
        // value={value}
        // onChange={handleInputChange}
        />;
    }

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            {inputElement}
            <Checkbox checked={checked} onChange={handleCheckboxChange} />
        </Box>
    );
};

export default DominoFormItem;
