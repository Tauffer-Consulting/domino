from datetime import datetime

workflow_request_model = {
    "forageSchema": {
            "workflowPieces": {
                "7_94e2bb3c-e1c0-417b-b111-78107e94d308": {
                    "id": 7,
                    "name": "SimpleLogPiece",
                    "description": "A Piece that simply logs its input",
                    "dependency": {
                        "dockerfile": None,
                        "requirements_file": "requirements_0.txt"
                    },
                    "source_image": "ghcr.io/tauffer-consulting/default_domino_pieces:0.5.0-group0",
                    "input_schema": {
                        "$defs": {
                            "InputEnum": {
                                "enum": [
                                    "option1",
                                    "option2",
                                    "option3"
                                ],
                                "title": "InputEnum",
                                "type": "string"
                            }
                        },
                        "description": "SimpleLogPiece Input Model",
                        "properties": {
                            "input_str": {
                                "default": "default value",
                                "description": "Input string to be logged.",
                                "title": "Input Str",
                                "type": "string"
                            },
                            "input_int": {
                                "default": 10,
                                "description": "Input integer to be logged.",
                                "title": "Input Int",
                                "type": "integer"
                            },
                            "input_float": {
                                "default": 10.5,
                                "description": "Input float to be logged.",
                                "title": "Input Float",
                                "type": "number"
                            },
                            "input_bool": {
                                "default": False,
                                "description": "Input boolean to be logged.",
                                "title": "Input Bool",
                                "type": "boolean"
                            },
                            "input_enum": {
                                "allOf": [
                                    {
                                        "$ref": "#/$defs/InputEnum"
                                    }
                                ],
                                "default": "option1",
                                "description": "Input enum to be logged."
                            },
                            "input_date": {
                                "default": "2023-01-01",
                                "description": "Input date to be logged.",
                                "format": "date",
                                "title": "Input Date",
                                "type": "string"
                            },
                            "input_time": {
                                "default": "16:20:00",
                                "description": "Input time to be logged.",
                                "format": "time",
                                "title": "Input Time",
                                "type": "string"
                            },
                            "input_datetime": {
                                "default": "2023-01-01T16:20:00",
                                "description": "Input datetime to be logged.",
                                "format": "date-time",
                                "title": "Input Datetime",
                                "type": "string"
                            },
                            "input_array": {
                                "default": [
                                    "default_1",
                                    "default_2",
                                    "default_3"
                                ],
                                "description": "Input array to be logged.",
                                "items": {
                                    "type": "string"
                                },
                                "title": "Input Array",
                                "type": "array"
                            },
                            "input_code": {
                                "default": "print('Hello world!')",
                                "description": "Input code to be logged.",
                                "title": "Input Code",
                                "type": "string",
                                "widget": "codeeditor"
                            }
                        },
                        "title": "SimpleLogPiece",
                        "type": "object"
                    },
                    "output_schema": {
                        "description": "SimpleLogPiece Output Model",
                        "properties": {
                            "message": {
                                "default": "",
                                "description": "Output message to log.",
                                "title": "Message",
                                "type": "string"
                            },
                            "output_msg": {
                                "description": "Value that was logged.",
                                "title": "Output Msg",
                                "type": "string"
                            },
                            "output_str": {
                                "anyOf": [
                                    {
                                        "type": "string"
                                    },
                                    {
                                        "type": "null"
                                    }
                                ],
                                "description": "Output string to be logged.",
                                "title": "Output Str"
                            },
                            "output_int": {
                                "anyOf": [
                                    {
                                        "type": "integer"
                                    },
                                    {
                                        "type": "null"
                                    }
                                ],
                                "description": "Output integer to be logged.",
                                "title": "Output Int"
                            },
                            "output_float": {
                                "anyOf": [
                                    {
                                        "type": "number"
                                    },
                                    {
                                        "type": "null"
                                    }
                                ],
                                "description": "Output float to be logged.",
                                "title": "Output Float"
                            },
                            "output_bool": {
                                "anyOf": [
                                    {
                                        "type": "boolean"
                                    },
                                    {
                                        "type": "null"
                                    }
                                ],
                                "description": "Output boolean to be logged.",
                                "title": "Output Bool"
                            },
                            "output_date": {
                                "description": "Output date to be logged.",
                                "format": "date",
                                "title": "Output Date",
                                "type": "string"
                            },
                            "output_time": {
                                "description": "Output time to be logged.",
                                "format": "time",
                                "title": "Output Time",
                                "type": "string"
                            },
                            "output_datetime": {
                                "description": "Output datetime to be logged.",
                                "format": "date-time",
                                "title": "Output Datetime",
                                "type": "string"
                            },
                            "output_array": {
                                "description": "Output array to be logged.",
                                "items": {
                                    "type": "string"
                                },
                                "title": "Output Array",
                                "type": "array"
                            },
                            "output_code": {
                                "description": "Input code to be logged.",
                                "title": "Output Code",
                                "type": "string",
                                "widget": "codeeditor"
                            }
                        },
                        "required": [
                            "output_msg",
                            "output_str",
                            "output_int",
                            "output_float",
                            "output_bool",
                            "output_date",
                            "output_time",
                            "output_datetime",
                            "output_array",
                            "output_code"
                        ],
                        "title": "OutputModel",
                        "type": "object"
                    },
                    "secrets_schema": None,
                    "style": {
                        "module": "SimpleLogPiece",
                        "label": "Simple Log Piece",
                        "nodeType": "default",
                        "nodeStyle": {
                            "backgroundColor": "#b3cde8"
                        },
                        "useIcon": True,
                        "iconClassName": "fa-solid:file-alt",
                        "iconStyle": {
                            "cursor": "pointer"
                        }
                    },
                    "source_url": "https://github.com/Tauffer-Consulting/default_domino_pieces/tree/main/pieces/SimpleLogPiece",
                    "repository_id": 2
                }
            },
            "workflowPiecesData": {
                "7_94e2bb3c-e1c0-417b-b111-78107e94d308": {
                    "storage": {
                        "storageAccessMode": "Read/Write"
                    },
                    "containerResources": {
                        "cpu": {
                            "min": 100,
                            "max": 100
                        },
                        "memory": {
                            "min": 128,
                            "max": 128
                        },
                        "useGpu": False
                    },
                    "inputs": {
                        "input_str": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "default value"
                        },
                        "input_int": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": 10
                        },
                        "input_float": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": 10.5
                        },
                        "input_bool": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": False
                        },
                        "input_enum": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "option1"
                        },
                        "input_date": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "2023-01-01"
                        },
                        "input_time": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "16:20:00"
                        },
                        "input_datetime": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "2023-01-01T16:20:00"
                        },
                        "input_array": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": [
                                {
                                    "fromUpstream": False,
                                    "upstreamId": "",
                                    "upstreamArgument": "",
                                    "upstreamValue": "",
                                    "value": "default_1"
                                },
                                {
                                    "fromUpstream": False,
                                    "upstreamId": "",
                                    "upstreamArgument": "",
                                    "upstreamValue": "",
                                    "value": "default_2"
                                },
                                {
                                    "fromUpstream": False,
                                    "upstreamId": "",
                                    "upstreamArgument": "",
                                    "upstreamValue": "",
                                    "value": "default_3"
                                }
                            ]
                        },
                        "input_code": {
                            "fromUpstream": False,
                            "upstreamId": "",
                            "upstreamArgument": "",
                            "upstreamValue": "",
                            "value": "print('Hello world!')"
                        }
                    }
                }
            },
            "workflowNodes": [
                {
                    "id": "7_94e2bb3c-e1c0-417b-b111-78107e94d308",
                    "type": "CustomNode",
                    "position": {
                        "x": 639,
                        "y": 218.5
                    },
                    "data": {
                        "name": "SimpleLogPiece",
                        "style": {
                            "module": "SimpleLogPiece",
                            "label": "Simple Log Piece",
                            "nodeType": "default",
                            "nodeStyle": {
                                "backgroundColor": "#b3cde8"
                            },
                            "useIcon": True,
                            "iconClassName": "fa-solid:file-alt",
                            "iconStyle": {
                                "cursor": "pointer"
                            }
                        },
                        "validationError": False,
                        "orientation": "horizontal"
                    },
                    "width": 150,
                    "height": 70,
                    "selected": True,
                    "positionAbsolute": {
                        "x": 639,
                        "y": 218.5
                    },
                    "dragging": False
                }
            ],
            "workflowEdges": []
    },
    "workflow": {
        "name": "test",
        "schedule": "none",
        "select_end_date": "never",
        "start_date": str(datetime.utcnow().date())
    },
    "tasks": {
        "SimpleLogP_0298c1669d404e08b631ebe1490e1c45": {
            "task_id": "SimpleLogP_0298c1669d404e08b631ebe1490e1c45",
            "piece": {
                "name": "SimpleLogPiece",
                "source_image": "ghcr.io/tauffer-consulting/default_domino_pieces_tests:0.0.4-group0"
            },
            "workflow_shared_storage": {
                "source": "None",
                "mode": "Read/Write",
                "provider_options": {}
            },
            "dependencies": [],
            "container_resources": {
                "requests": {
                    "cpu": 100,
                    "memory": 128
                },
                "limits": {
                    "cpu": 100,
                    "memory": 128
                },
                "use_gpu": False
            },
            "piece_input_kwargs": {
                "input_str": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "default value"
                },
                "input_int": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": 10
                },
                "input_float": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": 10.5
                },
                "input_bool": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": False
                },
                "input_enum": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "option1"
                },
                "input_date": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "2023-01-01"
                },
                "input_time": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "16:20:00"
                },
                "input_datetime": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "2023-01-01T16:20:00"
                },
                "input_array": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": [
                        {
                            "fromUpstream": False,
                            "upstreamTaskId": None,
                            "upstreamArgument": None,
                            "value": "default_1"
                        },
                        {
                            "fromUpstream": False,
                            "upstreamTaskId": None,
                            "upstreamArgument": None,
                            "value": "default_2"
                        },
                        {
                            "fromUpstream": False,
                            "upstreamTaskId": None,
                            "upstreamArgument": None,
                            "value": "default_3"
                        }
                    ]
                },
                "input_code": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "print('Hello world!')"
                }
            }
        }
    },
    "ui_schema": {
        "nodes": {
            "SimpleLogP_0298c1669d404e08b631ebe1490e1c45": {
                "id": "4_0298c166-9d40-4e08-b631-ebe1490e1c45",
                "type": "CustomNode",
                "position": {
                    "x": 691,
                    "y": 166.5
                },
                "data": {
                    "name": "SimpleLogPiece",
                    "style": {
                        "module": "SimpleLogPiece",
                        "label": "Simple Log Piece",
                        "nodeType": "default",
                        "nodeStyle": {
                            "backgroundColor": "#b3cde8"
                        },
                        "useIcon": True,
                        "iconClassName": "far fa-file-alt",
                        "iconStyle": {
                            "cursor": "pointer"
                        }
                    },
                    "validationError": False,
                    "orientation": "horizontal"
                },
                "width": 150,
                "height": 70,
                "selected": False,
                "dragging": False
            }
        },
        "edges": []
    }
}