import pytest
import json
from ..api_test_client import ApiTestClient
from httpx import Response
from typing import Dict
from uuid import uuid4

from database.models.workspace import Workspace
from schemas.requests.workspace import CreateWorkspaceRequest, PatchWorkspaceRequest

pytest_plugins=[
    "tests.auth.fixtures"
]

@pytest.fixture(scope="class")
def workspace():
    return Workspace(
        id=1,
        name="workspace_test",
        github_access_token=None
    )

@pytest.fixture(scope="class")
def create_workspace(client: ApiTestClient, authorization_token: Dict, workspace: Workspace):
    create_workspace_request = CreateWorkspaceRequest(
        name = workspace.name
    )
    body = json.loads(create_workspace_request.json())
    response = client.post(
        "/workspaces",
        headers = {"Authorization": authorization_token["header"]},
        json = body
    )
    content = response.json()
    workspace.id = content.get("id")
    return response

@pytest.fixture(scope="function")
def patch_workspace(client: ApiTestClient, authorization_token: Dict, workspace: Workspace):
    patch_workspace_request = PatchWorkspaceRequest(
        github_access_token = 'ghp_1234567890'
    )
    body = json.loads(patch_workspace_request.json())
    response = client.patch(
        f"/workspaces/{workspace.id}",
        headers={"Authorization": authorization_token["header"]},
        json=body
    )
    content = response.json()
    if content.get('github_access_token_filled'):
        workspace.github_access_token = "ghp_1234567890"
    return response

@pytest.fixture(scope="function")
def get_workspaces(client: ApiTestClient, authorization_token: Dict):
    return client.get(
        "/workspaces",
        headers = {"Authorization": authorization_token["header"]},
        params = {"page": 0, "page_size": 10}
    )

@pytest.fixture(scope="function")
def get_workspace(client: ApiTestClient, authorization_token: Dict, workspace: Workspace):
    return client.get(
        f"/workspaces/{workspace.id}",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def delete_workspace(client: ApiTestClient, authorization_token: Dict, get_workspaces: Response, workspace: Workspace):
    return client.delete(
        f"/workspaces/{workspace.id}",
        headers = {"Authorization": authorization_token["header"]}
    )
