import pytest
from ..api_test_client import ApiTestClient
from typing import Dict
from database.models.user import User
from database.models.workspace import Workspace

@pytest.fixture(scope="session")
def register(client: ApiTestClient, user: User):
    body = {"email": user.email, "password": user.password}
    response = client.post(
        "/auth/register",
        json=body
    )
    return response

@pytest.fixture(scope="session")
def login(client: ApiTestClient, authorization_token: Dict, user: User, default_workspace: Workspace):
    body = {"email": user.email, "password": user.password}
    response = client.post(
        "/auth/login",
        json=body
    )
    content = response.json()
    default_workspace.id = content["workspaces_ids"][0]
    user.id = content.get("user_id")
    authorization_token["header"] = f"Bearer {content.get('access_token')}"
    return response