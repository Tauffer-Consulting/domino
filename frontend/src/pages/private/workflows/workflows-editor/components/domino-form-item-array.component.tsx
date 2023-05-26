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
    type ObjectWithBooleanValues = { [key: string]: boolean };
    const [checkedFromUpstreamItemProp, setCheckedFromUpstreamItemProp] = useState<ObjectWithBooleanValues[]>(() => {
        if (itemSchema.default && itemSchema.default.length > 0) {
            const newArray = new Array<ObjectWithBooleanValues>(itemSchema.default.length).fill({});
            return newArray;
        } else {
            return [];
        }
    });


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
        setCheckedFromUpstreamItemProp([...checkedFromUpstreamItemProp, {}]);
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = [...arrayItems];
        updatedItems.splice(index, 1);
        setArrayItems(updatedItems);
        const updatedCheckedFromUpstreamItemProp = [...checkedFromUpstreamItemProp];
        updatedCheckedFromUpstreamItemProp.splice(index, 1);
        setCheckedFromUpstreamItemProp(updatedCheckedFromUpstreamItemProp);
    };

    // FromUpstream logic
    const handleCheckboxFromUpstreamChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, itemKey: string) => {
        setCheckedFromUpstreamItemProp((prevArray) => {
            const newArray = [...prevArray];
            const objectToUpdate = newArray[index] as { [key: string]: boolean };
            objectToUpdate[itemKey] = event.target.checked;
            newArray[index] = objectToUpdate;
            return newArray;
        });
        console.log(checkedFromUpstreamItemProp);
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
        const numProps = Object.keys(arrayOfProperties).length;
        // Loop through each of the item's properties and create the inputs for them
        {
            Object.keys(arrayOfProperties).map((itemKey, subIndex) => {
                let inputElement: JSX.Element;
                const subItemPropSchema = arrayOfProperties[itemKey];
                let initialValue: any = '';
                if (typeof arrayItems[index] === 'object') {
                    initialValue = arrayItems[index as number][itemKey as keyof typeof arrayItems[number]];
                } else {
                    initialValue = arrayItems[index as number];
                }
                if (checkedFromUpstreamItemProp[index]?.[itemKey]) {
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
                } else if (subItemPropSchema?.allOf && subItemPropSchema.allOf.length > 0) {
                    const typeClass = subItemPropSchema.allOf[0]['$ref'].split("/").pop();
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
                itemElements.push(
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        {inputElement}
                        {fromUpstreamMode !== "never" ? (
                            <Checkbox
                                checked={checkedFromUpstreamItemProp[index]?.[itemKey]}
                                onChange={(event) => handleCheckboxFromUpstreamChange(event, index, itemKey)}
                                disabled={subItemPropSchema?.from_upstream === 'never' || subItemPropSchema?.from_upstream === 'always'}
                            />
                        ) : null}
                    </div>
                );
            });
        }
        return <div
            style={{
                display: 'flex',
                flexDirection: fromUpstreamMode === 'never' && numProps < 3 ? 'row' : 'column',
                width: '100%'
            }}
        >
            {itemElements}
        </div>
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

export default ArrayInputItem;
