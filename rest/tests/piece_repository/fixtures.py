import pytest
from ..api_test_client import ApiTestClient
from typing import Dict
import json

from database.models.piece_repository import PieceRepository
from database.models.workspace import Workspace
from schemas.requests.piece_repository import CreateRepositoryRequest, PatchRepositoryRequest

pytest_plugins = [
    "tests.auth.fixtures",
    "tests.workspace.fixtures",
    "tests.piece.fixtures"
]

@pytest.fixture(scope="function")
def get_repository_releases(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository, default_workspace):
    response = client.get(
        f"/pieces-repositories/releases",
        params={"source": piece_repository.source, "path": piece_repository.path, "workspace_id": default_workspace.id},
        headers={"Authorization": authorization_token["header"]}
    )
    return response

@pytest.fixture(scope="class")
def add_piece_repository(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository, default_workspace: Workspace):
    # repository_version = get_repository_releases.json()
    # piece_repository.version = repository_version[0].get("version") #first element has the latest version release
    piece_repository.workspace_id = default_workspace.id
    add_piece_repository_request = CreateRepositoryRequest(
        workspace_id=piece_repository.workspace_id,
        source=piece_repository.source,
        path=piece_repository.path,
        version=piece_repository.version,
        url=piece_repository.url
    )
    body = json.loads(add_piece_repository_request.model_dump_json())
    response = client.post(
        "/pieces-repositories",
        headers={"Authorization": authorization_token["header"]},
        json=body
    )
    content = response.json()
    # if content.get("id") != None:
    piece_repository.id = content.get("id")
    piece_repository.name = content.get("name")
    piece_repository.label = content.get('label')
    piece_repository.created_at = content.get("created_at")
    piece_repository.version = content.get("version")
    return response


@pytest.fixture(scope="function")
def get_pieces_repositories(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        "/pieces-repositories",
        params={"workspace_id": piece_repository.workspace_id, "name__like": piece_repository.name},
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def get_piece_repository_release_data(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository, default_workspace: Workspace):
    return client.get(
        f"/pieces-repositories/releases/{piece_repository.version}",
        params={"source": piece_repository.source, "path": piece_repository.path, 'workspace_id': default_workspace.id},
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def get_piece_repository_by_id(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.get(
        f"/pieces-repositories/{piece_repository.id}",
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def patch_piece_repository(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    piece_repository.version = "0.0.5"
    patch_piece_repository_request = PatchRepositoryRequest(
        version=piece_repository.version
    )
    body = json.loads(patch_piece_repository_request.model_dump_json())
    response = client.patch(
        f"/pieces-repositories/{piece_repository.id}",
        headers={"Authorization": authorization_token["header"]},
        json=body
    )
    content = response.json()
    piece_repository.created_at = content.get("created_at")
    return response

@pytest.fixture(scope="function")
def delete_piece_repository(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    return client.delete(
        f"/pieces-repositories/{piece_repository.id}",
        headers={"Authorization": authorization_token["header"]}
    )
    