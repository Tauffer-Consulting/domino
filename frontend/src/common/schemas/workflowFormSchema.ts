
export const workflowFormSchema = {
    "type": "object",
    "title": "workflowForm",
    "properties": {
        "config": {
            "type": "object",
            "title": "Config",
            "properties": {
                "name": {
                    "title": "Name",
                    "type": "string",
                    "minLength": 3,
                    "description": "Workflow Name"
                },
                "schedule_interval": {
                    "title": "Schedule Interval",
                    "type": "string",
                    "enum": [
                        "none",
                        "once",
                        "hourly",
                        "daily",
                        "weekly",
                        "monthly",
                        "yearly"
                    ],
                    "default": "none"
                },
                "start_date": {
                    "title": "Start Date",
                    "type": "string",
                    "format": "date"
                },
                "generate_report": {
                    "title": "Generate Report",
                    "type": "boolean",
                    "default": false,
                    "description": "[description]"
                }
            },
            "required": [
                "name",
                "start_date",
                "schedule_interval"
            ]
        },
        // Why object schemas is not separating the forms in two section as before?
        "storage": {
            "type": "object",
            "title": "Storage",
            "properties": {
                "source": {
                    "title": "Storage Source",
                    "type": "string",
                    "enum": process.env.REACT_APP_DOMINO_DEPLOY_MODE === "local-compose" ? [
                        "None",
                        "Local",
                    ] :
                        [
                            "None",
                            "AWS S3"
                        ],
                    "default": "None"
                },
                "baseFolder": {
                    "title": "Base folder",
                    "type": "string",
                    "description": "Base folder from source storage.",
                    "default": ""
                },
                "bucket": {
                    "title": "Bucket name",
                    "type": "string",
                    "description": "Name for the S3 Bucket.",
                }
            },
            "required": [
                "source"
            ]
        }
    },
}

export const workflowFormUISchema = {
    "type": "VerticalLayout",
    "elements": [
        {
            "type": "Group",
            "label": "Settings",
            "elements": [
                {
                    "type": "Control",
                    "scope": "#/properties/config/properties/name"
                },
                {
                    "type": "Control",
                    "scope": "#/properties/config/properties/schedule_interval"
                },
                {
                    "type": "Control",
                    "scope": "#/properties/config/properties/start_date"
                },
                {
                    "type": "Control",
                    "scope": "#/properties/config/properties/generate_report"
                },
            ]
        },
        // TODO check why group label font size is small
        {
            "type": "Group",
            "label": "Storage",
            "elements": [
                {
                    "type": "Control",
                    "scope": "#/properties/storage/properties/source"
                },
                {
                    "type": "Control",
                    "scope": "#/properties/storage/properties/baseFolder",
                    "rule": {
                        "effect": "SHOW",
                        "condition": {
                            "scope": "#/properties/storage/properties/source",
                            "schema": {
                                "enum": [
                                    "AWS S3"
                                ]
                            }
                        }
                    }
                },
                {
                    "type": "Control",
                    "scope": "#/properties/storage/properties/bucket",
                    "rule": {
                        "effect": "SHOW",
                        "condition": {
                            "scope": "#/properties/storage/properties/source",
                            "schema": {
                                "enum": [
                                    "AWS S3"
                                ]
                            }
                        }
                    }
                },
            ]
        }
    ]
}