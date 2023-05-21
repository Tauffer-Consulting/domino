import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    IconButton,
    Box,
    Checkbox,
    Input,
    Select,
    MenuItem,
    SelectChangeEvent,
    FormControl,
    InputLabel,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';


// Arrays usually have their inner schema defined in the main schema definitions
interface ArrayInputCardProps {
    itemSchema: any;
    parentSchemaDefinitions: any;
}

const ArrayInputCard: React.FC<ArrayInputCardProps> = ({ itemSchema, parentSchemaDefinitions }) => {
    const [arrayItems, setArrayItems] = useState<string[]>(['']);
    const [checkedFromUpstream, setCheckedFromUpstream] = useState(false)

    // Sub-items schema
    let subItemSchema: any = itemSchema.items;
    if (itemSchema.items?.$ref) {
        const subItemSchemaName = itemSchema.items.$ref.split('/').pop();
        subItemSchema = parentSchemaDefinitions[subItemSchemaName];
    }

    console.log(itemSchema);
    console.log(subItemSchema);

    const handleArrayItemChange = (index: number, value: string) => {
        const updatedItems = [...arrayItems];
        updatedItems[index] = value;
        setArrayItems(updatedItems);
    };

    // Add and delete items
    const handleAddItem = () => {
        setArrayItems([...arrayItems, '']);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = [...arrayItems];
        updatedItems.splice(index, 1);
        setArrayItems(updatedItems);
    };

    // FomrUpstream logic
    const handleCheckboxFromUpstreamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedFromUpstream(event.target.checked);
    };
    const handleSelectFromUpstreamChange = (event: SelectChangeEvent<any>) => {
        console.log(event.target.value);
    };

    // TODO: create a function that returns the correct input element based on the schema
    // TODO: it can be multiple types of input elements, like select, checkbox, etc.
    {
        if (subItemSchema?.properties) {
            Object.keys(subItemSchema?.properties).map(key => (
                console.log(key)
            ))
        }
    }



    // create element
    const createInputElement = (item: string, index: number) => {
        let inputElement: JSX.Element;
        if (checkedFromUpstream) {
            const options = ['upstream 1', 'upstream 2', 'upstream 3', 'upstream 4'];
            inputElement = (
                <FormControl fullWidth>
                    <InputLabel>{itemSchema.title}</InputLabel>
                    <Select
                        fullWidth
                        // value={value}
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
        } else {
            inputElement = <TextField
                fullWidth
                label={`${itemSchema.title} [${index}]`}
                value={item}
                onChange={(e) => handleArrayItemChange(index, e.target.value)}
            />
        }
        return inputElement;
    }

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
                        sx={{ mb: 1 }}
                    >
                        <IconButton onClick={() => handleDeleteItem(index)} aria-label="Delete">
                            <DeleteIcon />
                        </IconButton>
                        {createInputElement(item, index)}
                        <Checkbox checked={checkedFromUpstream} onChange={handleCheckboxFromUpstreamChange} />
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

export default ArrayInputCard;
