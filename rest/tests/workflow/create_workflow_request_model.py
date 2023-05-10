from datetime import datetime

workflow_request_model = {
    "workflow": {
        "schedule_interval": "none",
        "generate_report": False,
        "name": "WorkflowTest",
        "start_date": str(datetime.utcnow().date())
    },
    "tasks": {
        "task_1": {
            "workflow_shared_storage": {
                "source": "Local"
            },
            "container_resources":{
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
            "task_id": "task_1",
            "piece": {
                "id": 988,
                "name": "SimpleLogPiece"
            },
            "piece_input_kwargs": {
                "input_arg_1": {
                    "fromUpstream": False,
                    "upstreamTaskId": None,
                    "upstreamArgument": None,
                    "value": "default"
                }
            },
            "dependencies": []
        },
        "task_2": {
            "workflow_shared_storage": {
                "source": "Local"
            },
            "container_resources":{
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
            "task_id": "task_2",
            "piece": {
                "id": 988,
                "name": "SimpleLogPiece"
            },
            "piece_input_kwargs": {
                "input_arg_1": {
                    "fromUpstream": True,
                    "upstreamTaskId": "task_1",
                    "upstreamArgument": "output_arg_1",
                    "value": "SimpleLogPiece - Output Arg 1"
                }
            },
            "dependencies": [
                "task_1"
            ]
        }
    },
    "ui_schema": {
        "nodes": {
            "task_1": {
                "id": "988_d6d95927-14ae-44c9-a772-8c76738b7af7",
                "type": "CustomNode",
                "position": {
                    "x": 623,
                    "y": 217.5
                },
                "data": {
                    "name": "SimpleLogPiece",
                    "style": {
                        "module": "SimpleLogPiece",
                        "label": "Example Piece",
                        "nodeType": "default",
                        "nodeStyle": {
                            "backgroundColor": "#b3cde8"
                        },
                        "useIcon": True,
                        "iconClassName": "fas fa-database",
                        "iconStyle": {
                            "cursor": "pointer"
                        }
                    },
                    "handleOriantation": "horizontal"
                },
                "width": 150,
                "height": 40,
                "selected": False,
                "positionAbsolute": {
                    "x": 623,
                    "y": 217.5
                },
                "dragging": False
            },
            "task_2": {
                "id": "988_0329f8ac-9402-42a4-975f-7d153e85e323",
                "type": "CustomNode",
                "position": {
                    "x": 933,
                    "y": 259.5
                },
                "data": {
                    "name": "SimpleLogPiece",
                    "style": {
                        "module": "SimpleLogPiece",
                        "label": "Example Piece",
                        "nodeType": "default",
                        "nodeStyle": {
                            "backgroundColor": "#b3cde8"
                        },
                        "useIcon": True,
                        "iconClassName": "fas fa-database",
                        "iconStyle": {
                            "cursor": "pointer"
                        }
                    },
                    "handleOriantation": "horizontal"
                },
                "width": 150,
                "height": 40,
                "selected": True,
                "positionAbsolute": {
                    "x": 933,
                    "y": 259.5
                },
                "dragging": False
            }
        },
        "edges": [
            {
                "source": "4_d6d95927-14ae-44c9-a772-8c76738b7af7",
                "sourceHandle": "$handle-source-4_d6d95927-14ae-44c9-a772-8c76738b7af7",
                "target": "4_0329f8ac-9402-42a4-975f-7d153e85e323",
                "targetHandle": "$handle-target-4_0329f8ac-9402-42a4-975f-7d153e85e323",
                "id": "reactflow__edge-4_d6d95927-14ae-44c9-a772-8c76738b7af7$handle-source-4_d6d95927-14ae-44c9-a772-8c76738b7af7-4_0329f8ac-9402-42a4-975f-7d153e85e323$handle-target-4_0329f8ac-9402-42a4-975f-7d153e85e323"
            }
        ]
    }
}
