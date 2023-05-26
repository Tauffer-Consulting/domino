import React, { useState } from 'react';
import {
    Card,
    CardContent,
    IconButton,
    Box,
    Checkbox,
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
            const initArray = [...itemSchema.default];
            return initArray;
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
    let arrayOfProperties: { [key: string]: any } = {};
    // If array subtypes were not defined in the schema, we create a default one
    if (subItemSchema?.properties) {
        arrayOfProperties = subItemSchema?.properties;
    } else {
        arrayOfProperties[itemSchema.title] = { "": "" };
    }
    const numProps = Object.keys(arrayOfProperties).length;


    // console.log("itemSchema", itemSchema);
    // console.log("subItemSchema", subItemSchema);
    // console.log("parentSchemaDefinitions", parentSchemaDefinitions);

    type ObjectWithBooleanValues = { [key: string]: boolean };
    const [checkedFromUpstreamItemProp, setCheckedFromUpstreamItemProp] = useState<ObjectWithBooleanValues[]>(() => {
        if (itemSchema.default && itemSchema.default.length > 0) {
            const initArray = new Array<ObjectWithBooleanValues>(itemSchema.default.length).fill({});
            // set the default values from the schema in cases where from_upstream==="always"
            initArray.map((obj, index) => {
                Object.keys(arrayOfProperties).map((itemKey) => {
                    if (subItemSchema?.properties?.[itemKey]?.from_upstream === "always") {
                        initArray[index][itemKey] = true;
                    } else {
                        initArray[index][itemKey] = false;
                    }
                    return null;
                });
                return null;
            });
            return initArray;
        } else {
            return [];
        }
    });

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

    // FromUpstream checkboxes logic
    // TODO - this is not working for multiple default items, they're changing together
    const handleCheckboxFromUpstreamChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, itemKey: string) => {
        console.log(checkedFromUpstreamItemProp);
        console.log("event", event.target.checked);
        console.log("index", index);
        console.log("itemkey", itemKey);
        setCheckedFromUpstreamItemProp((prevArray) => {
            const newArray = [...prevArray];
            console.log(newArray);
            const objectToUpdate = newArray[index] as { [key: string]: boolean };
            console.log(objectToUpdate);
            objectToUpdate[itemKey] = event.target.checked;
            newArray[index] = objectToUpdate;
            return newArray;
        });
        console.log(checkedFromUpstreamItemProp);
    };

    // FromUpstream select logic
    const handleSelectFromUpstreamChange = (event: SelectChangeEvent<any>) => {
        console.log(event.target.value);
    };

    // Each item in the array can be multiple inputs, with varied types like text, select, checkbox, etc.
    const createItemElements = (item: string, index: number) => {
        let itemElements: JSX.Element[] = [];
        // Loop through each of the item's properties and create the inputs for them
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
                    {subItemPropSchema?.from_upstream !== "never" ? (
                        <Checkbox
                            checked={subItemPropSchema?.from_upstream === 'always' ? true : checkedFromUpstreamItemProp[index]?.[itemKey]}
                            onChange={(event) => handleCheckboxFromUpstreamChange(event, index, itemKey)}
                            disabled={subItemPropSchema?.from_upstream === 'never' || subItemPropSchema?.from_upstream === 'always'}
                        />
                    ) : null}
                </div>
            );
            return null;
        });
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