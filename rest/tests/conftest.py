from .api_test_client import ApiTestClient
import pytest
from typing import Dict
from database.models import User, PieceRepository, Workflow, Workspace
import os


def pytest_collection_modifyitems(items):
    CLASS_ORDER = [
        "TestAuthRouter", 
        "TestWorkspaceRouter", 
        "TestPieceRepositoryRouter", 
        "TestPieceRouter", 
        "TestSecretRouter", 
        "TestWorkflowRouter",
        "TestUserRouter"
    ]
    class_mapping = {item: item.cls.__name__ for item in items}
    sorted_items = items.copy()
    for class_ in CLASS_ORDER:
        sorted_items = [it for it in sorted_items if class_mapping[it] != class_] + [
            it for it in sorted_items if class_mapping[it] == class_
        ]
    items[:] = sorted_items

@pytest.fixture(scope="session")
def client():
    base_url = os.environ.get('TESTS_API_URL', 'http://localhost/api')
    with ApiTestClient(base_url=base_url) as c: 
        yield c

@pytest.fixture(scope="session")
def authorization_token():
    authorization_token = {}
    return authorization_token

@pytest.fixture(scope="session")
def user():
    return User(
        email = "test_user@example.com",
        password = "123"
    )

@pytest.fixture(scope="session")
def default_workspace():
    return Workspace(
        id=1,
        name="default_workspace",
        github_access_token=os.environ.get('DOMINO_TESTS_WORKSPACE_GITHUB_ACCESS_TOKEN')
    )

@pytest.fixture(scope="session")
def piece_repository():
    return PieceRepository(
        id=1,
        source="github",
        path="Tauffer-Consulting/default_domino_pieces_tests",
        version="0.0.2",
        workspace_id=1,
        url='https://github.com/Tauffer-Consulting/default_domino_pieces'
    )

@pytest.fixture(scope="class")
def workflow(default_workspace: Workspace):
    return Workflow(
        id = 1,
        name = "workflow_test",
        workspace_id = default_workspace.id
    )

@pytest.fixture(scope="class")
def teardown_piece_repository(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    yield
    client.delete(
        f"/pieces-repositories/{piece_repository.id}",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="session", autouse=True)
def teardown_user_test(client: ApiTestClient, authorization_token: Dict, user: User):
    yield
    body = {"email": user.email, "password": user.password}
    login = client.post(
        "/auth/login",
        json = body
    )
    if login.status_code == 200:
        client.delete(
            f"/users/{user.id}",
            headers = {"Authorization": authorization_token["header"]}
        )
