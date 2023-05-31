import pytest
from ..api_test_client import ApiTestClient
from typing import Dict

from database.models.workspace import Workspace
from database.models.piece_repository import PieceRepository
from database.models.workflow import Workflow
from tests.workflow.create_workflow_request_model import workflow_request_model

pytest_plugins = [
    "tests.auth.fixtures",
    "tests.workspace.fixtures",
    "tests.piece.fixtures",
    "tests.secret.fixtures"
]

@pytest.fixture(scope="class")
def create_workflow(client: ApiTestClient, authorization_token: Dict, edit_workflow_request_model: Dict, workflow: Workflow, default_workspace: Workspace):
    # all_pieces = get_pieces.json()
    # example_piece = [i for i in all_pieces if i["name"]=="SimpleLogPiece"][0]
    workflow_request_model = edit_workflow_request_model
    body = workflow_request_model
    response = client.post(
        f"/workspaces/{default_workspace.id}/workflows",
        headers = {"Authorization": authorization_token["header"]},
        json = body
    )
    content = response.json()
    workflow.id = content.get("id")
    workflow.name = content.get("name")
    workflow.created_at = content.get("created_at")
    workflow.created_by = content.get("created_by")
    workflow.last_changed_at = content.get("last_changed_at")
    workflow.last_changed_by = content.get("last_changed_by")
    workflow.workspace_id = content.get("workspace_id")
    return response



@pytest.fixture(scope="function")
def get_workflows(client: ApiTestClient, default_workspace: Workspace, authorization_token: Dict):
    return client.get(
        f"/workspaces/{default_workspace.id}/workflows",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def get_workflow(client: ApiTestClient, default_workspace: Workspace, workflow: Workflow, authorization_token: Dict):
    return client.get(
        f"/workspaces/{default_workspace.id}/workflows/{workflow.id}",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="function")
def delete_workflow(client: ApiTestClient, authorization_token: Dict, workflow: Workflow, default_workspace: Workspace):
    return client.delete(
        f"/workspaces/{default_workspace.id}/workflows/{workflow.id}",
        headers = {"Authorization": authorization_token["header"]}
    )

@pytest.fixture(scope="class")
def edit_workflow_request_model(client: ApiTestClient, authorization_token: Dict, piece_repository: PieceRepository):
    response = client.get(
        f"/pieces-repositories/{piece_repository.id}/pieces",
        headers = {"Authorization": authorization_token["header"]},
        params = {"name__like": "SimpleLogPiece"}
    )
    possible_pieces = response.json()
    example_piece = [i for i in possible_pieces if i["name"]=="SimpleLogPiece"][0]

    workflow_request_model["tasks"]["task_1"]["piece"]["id"] = example_piece["id"]
    workflow_request_model["tasks"]["task_2"]["piece"]["id"] = example_piece["id"]
    
    curret_id = workflow_request_model['ui_schema']['nodes']['task_1']['id']
    current_db_id = curret_id.split("_")[0]
    workflow_request_model["ui_schema"]["nodes"]["task_1"]["id"] = curret_id.replace(f"{current_db_id}", str(example_piece["id"]))

    curret_id = workflow_request_model['ui_schema']['nodes']['task_2']['id']
    current_db_id = curret_id.split("_")[0]
    workflow_request_model["ui_schema"]["nodes"]["task_2"]["id"] = curret_id.replace(f"{current_db_id}", str(example_piece["id"]))
    
    return workflow_request_model

