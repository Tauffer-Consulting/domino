import pytest
from ..api_test_client import ApiTestClient
from httpx import Response
from typing import Dict

from database.models.piece_repository import PieceRepository
from schemas.responses.secret import ListRepositorySecretsResponse

pytest_plugins = [
    "tests.auth.fixtures",
    "tests.workspace.fixtures",
    "tests.piece.fixtures",
    "tests.piece_repository.fixtures"
]

@pytest.fixture(scope="class")
def get_repository_secrets(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}/secrets",
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="class")
def patch_piece_secret(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository, get_repository_secrets: Response):
    repository_secrets = get_repository_secrets.json()
    secret_id = [i["id"] for i in repository_secrets if i["name"] == "EXAMPLE_VAR"][0]
    return client.patch(
        f"/pieces-repositories/{piece_repository.id}/secrets/{secret_id}",
        headers={"Authorization": authorization_token["header"]},
        json={"value": "123"}
    )

@pytest.fixture(scope="function")
def get_secrets_by_piece_name(request, client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}/secrets/{request.param['piece_name']}",
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def get_repository_secrets_mock_response():
    mock_response = [
        ListRepositorySecretsResponse(
            id=1,
            name="EXAMPLE_VAR",
            is_filled=False
        )
        # ListRepositorySecretsResponse(
        #     id=1,
        #     name="API_KEY",
        #     is_filled=False
        # ),
        # ListRepositorySecretsResponse(
        #     id=1,
        #     name="AWS_ACCESS_KEY_ID",
        #     is_filled=False
        # ),
        # ListRepositorySecretsResponse(
        #     id=1,
        #     name="AWS_SECRET_ACCESS_KEY",
        #     is_filled=False
        # ),
        # ListRepositorySecretsResponse(
        #     id=1,
        #     name="EXAMPLE_VAR",
        #     is_filled=False
        # ),
        # ListRepositorySecretsResponse(
        #     id=1,
        #     name="GITHUB_ACCESS_TOKEN",
        #     is_filled=False
        # )
    ]
    return mock_response
    

