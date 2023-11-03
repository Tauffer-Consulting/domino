from datetime import datetime

workflow_request_model = {
    "workflow": {
        "schedule": "none",
        "name": "WorkflowTest",
        "select_end_date": "never",
        "start_date": str(datetime.utcnow().date())
    },
    "tasks": {
        "SimpleLogP_0298c1669d404e08b631ebe1490e1c45": {
            "task_id": "SimpleLogP_0298c1669d404e08b631ebe1490e1c45",
            "piece": {
                "name": "SimpleLogPiece",
                "source_image": "ghcr.io/tauffer-consulting/default_domino_pieces_tests:0.0.2-group0"
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