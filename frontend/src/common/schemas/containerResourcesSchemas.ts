export const containerResourcesSchema = {
    type: 'object',
    properties: {
        "cpu": {
            "type": "object",
            "title": "CPU",
            "properties": {
                "min": {
                    "title": "Min - Thousandth of a core (m)",
                    "type": "number",
                    "default": 100, // todo: min value we will accept ?
                    //"maximum": 10000, // todo: max value we will accept ?
                    "minimum": 50 // todo: min value we will accept ?
                },
                "max": {
                    "title": "Max - Thousandth of a core (m)",
                    "type": "number",
                    "default": 100,
                    //"maximum": 10000, // todo: max value we will accept ?
                    "minimum": 50 // todo: min value we will accept ?
                }
            }
        },
        "memory": {
            "type": "object",
            "title": "Memory",
            "properties": {
                "min": {
                    "title": "Min - Mebibyte (Mi)",
                    "type": "number",
                    "default": 128,
                    //'maximum': 15258, // todo: max value we will accept ?
                    'minimum': 32
                },
                "max": {
                    "title": "Max - Mibibyte (Mi)",
                    "type": "number",
                    "default": 128,
                    //"maximum": 15258, // todo: max value we will accept ?
                    'minimum': 32
                }
            }
        },
        "useGpu":{
            "title": "Use GPU",
            "type": "boolean",
            "default": false
        },
    }
}