import json
import pytest
from httpx import Response
from typing import List

from schemas.responses.secret import GetSecretsByPieceResponse

pytest_plugins = [
    "tests.secret.fixtures"
]
@pytest.mark.usefixtures("register", "login", "add_piece_repository", "teardown_piece_repository")
class TestSecretRouter:    
    @staticmethod
    def test_get_repository_secrets(get_repository_secrets: Response, get_repository_secrets_mock_response: List):
        mock_response = get_repository_secrets_mock_response
        response = get_repository_secrets
        content = response.json()

        response_secrets_names = []
        for i in content:
            response_secrets_names.append(i.get("name"))
        response_secrets_names.sort()

        mock_response_secrets_names = []
        for secret in mock_response:
            secret_content = json.loads(secret.json())
            mock_response_secrets_names.append(secret_content.get("name"))
        mock_response_secrets_names.sort()
        
        assert response.status_code == 200

        mock_response_content = json.loads(mock_response[0].json())
        assert content[0].keys() == mock_response_content.keys()
        assert response_secrets_names == mock_response_secrets_names
    
    @staticmethod
    def test_patch_piece_secret(patch_piece_secret: Response):
        response = patch_piece_secret
        assert response.status_code == 204
    
    @staticmethod
    @pytest.mark.parametrize("get_secrets_by_piece_name", [{"piece_name": "SimpleLogPiece"}], indirect=True)
    def test_get_secrets_by_piece_name(get_secrets_by_piece_name: Response):
        mock_response = [
            GetSecretsByPieceResponse(
                name = "EXAMPLE_VAR",
                value = "123",
            )
        ]
        response = get_secrets_by_piece_name
        content = response.json()
        mock_response_content = json.loads(mock_response[0].model_dump_json())

        assert response.status_code == 200
        assert content[0] == mock_response_content

    