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


enum FromUpstreamOptions {
    always = "always",
    never = "never",
    allowed = "allowed"
}

// Arrays usually have their inner schema defined in the main schema definitions
interface ArrayInputItemProps {
    itemSchema: any;
    parentSchemaDefinitions: any;
    fromUpstreamMode?: FromUpstreamOptions | string;
}

const ArrayInputItem: React.FC<ArrayInputItemProps> = ({ itemSchema, parentSchemaDefinitions, fromUpstreamMode }) => {
    const [arrayItems, setArrayItems] = useState<string[]>(() => {
        if (itemSchema.default && itemSchema.default.length > 0) {
            return itemSchema.default;
        } else {
            return [""];
        }
    });
    const [checkedFromUpstream, setCheckedFromUpstream] = useState(() => {
        if (fromUpstreamMode === "always") {
            return true;
        } else {
            return false;
        }
    })

    // Sub-items schema
    let subItemSchema: any = itemSchema.items;
    if (itemSchema.items?.$ref) {
        const subItemSchemaName = itemSchema.items.$ref.split('/').pop();
        subItemSchema = parentSchemaDefinitions[subItemSchemaName];
    }

    // console.log("itemSchema", itemSchema);
    // console.log("subItemSchema", subItemSchema);
    // console.log("parentSchemaDefinitions", parentSchemaDefinitions);

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

    // Each item in the array can be multiple inputs, with varied types like text, select, checkbox, etc.
    const createItemElements = (item: string, index: number) => {
        let itemElements: JSX.Element[] = [];
        let arrayOfProperties: { [key: string]: any } = {};
        // If array subtypes were not defined in the schema, we create a default one
        if (subItemSchema?.properties) {
            arrayOfProperties = subItemSchema?.properties;
        } else {
            arrayOfProperties[itemSchema.title] = { "": "" };
        }
        // Loop through each of the item's properties and create the inputs for them
        {
            Object.keys(arrayOfProperties).map((itemKey, subIndex) => {
                let inputElement: JSX.Element;
                const subSubItemSchema = arrayOfProperties[itemKey];
                let initialValue: any = '';
                if (typeof arrayItems[index] === 'object') {
                    initialValue = arrayItems[index as number][itemKey as keyof typeof arrayItems[number]];
                } else {
                    initialValue = arrayItems[index as number];
                }
                if (checkedFromUpstream) {
                    const options = ['upstream 1', 'upstream 2', 'upstream 3', 'upstream 4'];
                    inputElement = (
                        <FormControl fullWidth>
                            <InputLabel>{`${itemKey} [${index}]`}</InputLabel>
                            <Select
                                fullWidth
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
                } else if (subSubItemSchema?.allOf && subSubItemSchema.allOf.length > 0) {
                    const typeClass = subSubItemSchema.allOf[0]['$ref'].split("/").pop();
                    const valuesOptions: Array<string> = parentSchemaDefinitions?.[typeClass].enum;
                    inputElement = (
                        <FormControl fullWidth>
                            <InputLabel>{`${itemKey} [${index}]`}</InputLabel>
                            <Select
                                value={initialValue}
                            // onChange={handleSelectChange}
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
                        onChange={(e) => handleArrayItemChange(index, e.target.value)}
                    />
                }
                itemElements.push(inputElement);
            });
        }
        return itemElements;
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
                        {createItemElements(item, index)}
                        {fromUpstreamMode !== "never" ? (
                            <Checkbox
                                checked={checkedFromUpstream}
                                onChange={handleCheckboxFromUpstreamChange}
                                disabled={fromUpstreamMode === "allowed" ? false : true}
                            />
                        ) : null}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

export default ArrayInputItem;
