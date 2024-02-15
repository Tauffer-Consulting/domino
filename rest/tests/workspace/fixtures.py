import pytest
import json
from ..api_test_client import ApiTestClient
from httpx import Response
from typing import Dict
import os
from schemas.requests.workspace import CreateWorkspaceRequest, PatchWorkspaceRequest
from database.models import User, Workspace
from database.models.enums import Permission


pytest_plugins=[
    "tests.auth.fixtures"
]

@pytest.fixture(scope="class")
def user_extra():
    return User(
        email = "test_user_extra@example.com",
        password = "123"
    )

@pytest.fixture(scope="session")
def default_workspace_user_extra():
    return Workspace(
        id=1,
        name="default_workspace_user_extra",
        github_access_token=os.environ.get('DOMINO_TESTS_WORKSPACE_GITHUB_ACCESS_TOKEN')
    )

@pytest.fixture(scope="class")
def authorization_token_user_extra():
    authorization_token_user_extra = {}
    return authorization_token_user_extra

@pytest.fixture(scope="class")
def register_user_extra(client: ApiTestClient, user_extra: User):
    body = {"email": user_extra.email, "password": user_extra.password}
    response = client.post(
        "/auth/register",
        json=body
    )
    return response

@pytest.fixture(scope="class")
def login_user_extra(client: ApiTestClient, authorization_token_user_extra: Dict, user_extra: User, default_workspace_user_extra: Workspace):
    body = {"email": user_extra.email, "password": user_extra.password}
    response = client.post(
        "/auth/login",
        json=body
    )
    content = response.json()
    default_workspace_user_extra.id = content["workspaces_ids"][0]
    user_extra.id = content.get("user_id")
    authorization_token_user_extra["header"] = f"Bearer {content.get('access_token')}"
    return response


@pytest.fixture(scope="class")
def workspace():
    return Workspace(
        id=1,
        name="workspace_test",
        github_access_token=None,
    )

@pytest.fixture(scope="class")
def create_workspace(client: ApiTestClient, authorization_token: Dict, workspace: Workspace):
    create_workspace_request = CreateWorkspaceRequest(
        name = workspace.name
    )
    body = json.loads(create_workspace_request.model_dump_json())
    response = client.post(
        "/workspaces",
        headers = {"Authorization": authorization_token["header"]},
        json = body
    )
    content = response.json()
    workspace.id = content.get("id")
    return response

@pytest.fixture(scope="function")
def invite_user(client: ApiTestClient, authorization_token: Dict, workspace: Workspace, user_extra: User):
    response = client.post(
        f"/workspaces/{workspace.id}/invites",
        headers={"Authorization": authorization_token["header"]},
        json={"user_email": user_extra.email, "permission": Permission.read.value}
    )
    return response

@pytest.fixture(scope='function')
def accept_invite(
    client: ApiTestClient,
    login_user_extra: Response,
    authorization_token_user_extra: Dict,
    workspace: Workspace,
):
    return client.post(
        f"/workspaces/{workspace.id}/invites/accept",
        headers={"Authorization": authorization_token_user_extra["header"]}
    )


@pytest.fixture(scope='function')
def reject_invite(
    client: ApiTestClient,
    login_user_extra: Response,
    authorization_token_user_extra: Dict,
    workspace: Workspace
):
    return client.post(
        f"/workspaces/{workspace.id}/invites/reject",
        headers={"Authorization": authorization_token_user_extra["header"]}
    )

@pytest.fixture(scope='function')
def list_workspace_users(
    client: ApiTestClient,
    authorization_token: Dict,
    workspace: Workspace
):
    return client.get(
        f'/workspaces/{workspace.id}/users?page=0&page_size=10',
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope='function')
def delete_user_from_workspace(
    client: ApiTestClient,
    authorization_token: Dict,
    workspace: Workspace,
    login_user_extra: Response,
    user_extra: User
):
    return client.delete(
        f"/workspaces/{workspace.id}/users/{user_extra.id}",
        headers={"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def patch_workspace(client: ApiTestClient, authorization_token: Dict, workspace: Workspace):
    patch_workspace_request = PatchWorkspaceRequest(
        github_access_token = 'ghp_1234567890'
    )
    body = json.loads(patch_workspace_request.model_dump_json())
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

@pytest.fixture(scope="class", autouse=True)
def teardown_user_test_extra(client: ApiTestClient, user_extra: User):
    yield
    body = {"email": user_extra.email, "password": user_extra.password}
    login = client.post(
        "/auth/login",
        json = body
    )
    if login.status_code == 200:
        content = login.json()
        client.delete(
            f"/users/{content.get('user_id')}",
            headers = {"Authorization": f"Bearer {content.get('access_token')}"}
        )
