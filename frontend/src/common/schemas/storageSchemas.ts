export const operatorStorageSchema = {
    type: 'object',
    properties: {
        "storageAccessMode": {
            "title": "Access Mode",
            "type": "string",
            "enum": [
                "None",
                "Read",
                "Read/Write",
            ],
            "default": "Read/Write"
        },
    }
}