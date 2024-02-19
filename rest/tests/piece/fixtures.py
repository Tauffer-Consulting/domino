import pytest
from ..api_test_client import ApiTestClient
from typing import Dict

from database.models.piece_repository import PieceRepository
from schemas.responses.piece import GetPiecesResponse

pytest_plugins = [
    "tests.auth.fixtures",
    "tests.piece_repository.fixtures",
    "tests.workspace.fixtures"
]

@pytest.fixture(scope="class")
def get_pieces(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}/pieces",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def get_pieces_pagination(request, client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}/pieces",
        headers = {"Authorization": authorization_token["header"]},
        params = {"page": request.param["page"], "page_size": request.param["page_size"]}
    )

@pytest.fixture(scope="function")
def get_piece_by_name(request, client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}/pieces",
        headers = {"Authorization": authorization_token["header"]},
        params = {"name__like": request.param["name"]}
    )

@pytest.fixture(scope="function")
def get_pieces_mock_response(piece_repository: PieceRepository):
    mock_response = [
        GetPiecesResponse(
            id = 1,
            name = "SimpleLogPiece",
            description = "some description",
            dependency = {
                "dockerfile": "",
                "requirements_file": "requirements_0.txt"
            },
            repository_url='https://github.com/Tauffer-Consulting/default_domino_pieces_tests',
            source_url='https://github.com/Tauffer-Consulting/default_domino_pieces_tests/tree/main/pieces/SimpleLogPiece',
            source_image = "ghcr.io/tauffer-consulting/default_domino_pieces_tests:0.0.4-group0",
            input_schema = {
                "title": "SimpleLogPiece",
                "description": "Example Operator",
                "type": "object",
                "properties": {
                    "input_arg_1": {
                        "title": "Input Arg 1",
                        "description": "description",
                        "default": "default",
                        "type": "string"
                    }
                }
            },
            output_schema = {
                "title": "OutputModel",
                "description": "Example Operator",
                "type": "object",
                "properties": {
                    "message": {
                        "title": "Message",
                        "description": "Output message to log",
                        "default": "",
                        "type": "string"
                    },
                    "output_arg_1": {
                        "title": "Output Arg 1",
                        "description": "description",
                        "default": "default",
                        "type": "string"
                    }
                }
            },
            secrets_schema = {
                "title": "SecretsModel",
                "description": "Example Operator Secrets",
                "type": "object",
                "properties": {
                    "EXAMPLE_VAR": {
                        "title": "Example Var",
                        "description": "Example secret var",
                        "type": "string"
                    }
                },
                "required": [
                    "EXAMPLE_VAR"
                ]
            },
            tags=['Example'],
            container_resources={
                "limits": {
                    "cpu": 100,
                    "memory": 128
                },
                "requests": {
                    "cpu": 100,
                    "memory": 128
                },
                "use_gpu": False

            },
            style = {
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
            repository_id = piece_repository.id
        )
        # GetPiecesResponse(
        #     id = 1,
        #     name = "ApiFetchSimpleLogPiece",
        #     description = "some description",
        #     dependency = {
        #         "docker_image": None,
        #         "dockerfile": None,
        #         "requirements_file": None
        #     },
        #     source_image = "taufferconsulting/example_project_image_1:0.2.0",
        #     input_schema = {
        #         "title": "ApiFetchSimpleLogPiece",
        #         "description": "Example Piece",
        #         "type": "object",
        #         "properties": {
        #             "airbnb_location_id": {
        #                 "title": "Airbnb Location Id",
        #                 "description": "Airbnb location id to search",
        #                 "default": "ChIJN3P2zJlG0i0RACx9yvsLAwQ",
        #                 "type": "string"
        #             },
        #             "currency": {
        #                 "title": "Currency",
        #                 "description": "Currency to use in price",
        #                 "default": "USD",
        #                 "type": "string"
        #             },
        #             "adults": {
        #                 "title": "Adults",
        #                 "description": "Number of adults",
        #                 "default": 1,
        #                 "type": "integer"
        #             }
        #         }
        #     },
        #     output_schema = {
        #         "title": "OutputModel",
        #         "description": "Example Piece",
        #         "type": "object",
        #         "properties": {
        #             "data": {
        #                 "title": "Data",
        #                 "description": "Output list with airbnb data",
        #                 "type": "array",
        #                 "items": {}
        #             },
        #             "message": {
        #                 "title": "Message",
        #                 "description": "Message to log",
        #                 "type": "string"
        #             }
        #         },
        #         "required": [
        #             "data",
        #             "message"
        #         ]
        #     },
        #     secrets_schema = {
        #         "title": "SecretsModel",
        #         "description": "Example Piece Secrets",
        #         "type": "object",
        #         "properties": {
        #             "API_KEY": {
        #                 "title": "Api Key",
        #                 "description": "API key",
        #                 "type": "string"
        #             }
        #         },
        #         "required": [
        #             "API_KEY"
        #         ]
        #     },
        #     style =  {
        #         "module": "ApiFetchSimpleLogPiece",
        #         "label": "Api Fetch Example Piece",
        #         "nodeType": "default",
        #         "nodeStyle": {
        #             "backgroundColor": "#b3cde8"
        #         },
        #         "useIcon": True,
        #         "iconClassName": "fas fa-database",
        #         "iconStyle": {
        #             "cursor": "pointer"
        #         }
        #     },
        #     repository_id = piece_repository.id,
        # ),
        # GetPiecesResponse(
        #     id = 2,
        #     name = "ApplyCV2FilterFromBytestringPiece",
        #     description = "Apply filter effect to bytestring Image",
        #     dependency = {
        #         "docker_image": None,
        #         "dockerfile": None,
        #         "requirements_file": "requirements_0.txt"
        #     },
        #     source_image = "taufferconsulting/example_project_image_0:0.2.0",
        #     input_schema = {
        #         "title": "ApplyCV2FilterFromBytestringPiece",
        #         "description": "Apply effect to image",
        #         "type": "object",
        #         "properties": {
        #             "bytestring_image": {
        #                 "title": "Bytestring Image",
        #                 "description": "Image as a bytestring",
        #                 "type": "string"
        #             },
        #             "effect": {
        #                 "description": "Effect to be applied",
        #                 "default": "random",
        #                 "allOf": [
        #                     {
        #                         "$ref": "#/definitions/EffectType"
        #                     }
        #                 ]
        #             }
        #         },
        #         "required": [
        #             "bytestring_image"
        #             ],
        #         "definitions": {
        #             "EffectType": {
        #                 "title": "EffectType",
        #                 "description": "An enumeration.",
        #                 "enum": [
        #                     "random",
        #                     "grayscale",
        #                     "bright",
        #                     "dark",
        #                     "sharp",
        #                     "sepia",
        #                     "pencil",
        #                     "pencil_color",
        #                     "hdr",
        #                     "invert",
        #                     "summer",
        #                     "winter"
        #                 ],
        #                 "type": "string"
        #             }
        #         }
        #     },
        #     output_schema = {
        #         "title": "OutputModel",
        #         "description": "Apply effect to image",
        #         "type": "object",
        #         "properties": {
        #             "bytestring_image": {
        #                 "title": "Bytestring Image",
        #                 "description": "Output image as a bytestring",
        #                 "type": "string"
        #             }
        #         },
        #         "required": [
        #             "bytestring_image"
        #         ]
        #     },
        #     secrets_schema = {
        #         "title": "SecretsModel",
        #         "description": "Secrets for Apply effect to image",
        #         "type": "object",
        #         "properties": {}
        #     },
        #     style = {
        #         "module": "ApplyCV2FilterFromBytestringPiece",
        #         "label": "Apply cv2 filter from bytestring",
        #         "nodeType": "source",
        #         "nodeStyle": {
        #             "backgroundColor": "#b3cde8"
        #         },
        #         "useIcon": True,
        #         "iconClassName": "fas fa-database",
        #         "iconStyle": {
        #             "cursor": "pointer"
        #         }
        #     },
        #     repository_id = piece_repository.id
        # )
    ]
    return mock_response

