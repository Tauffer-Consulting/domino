import json
import pytest
from httpx import Response
from datetime import datetime

from database.models.user import User
from database.models.workspace import Workspace
from database.models.workflow import Workflow
from database.models.piece_repository import PieceRepository
from schemas.responses.workflow import (
    CreateWorkflowResponse,
    WorkflowSchemaBaseModel,
    GetWorkflowResponse,
    BaseWorkflowModel,
    WorkflowConfigResponse,
    BaseUiSchema
)
from .create_workflow_request_model import workflow_request_model

pytest_plugins = [
    "tests.workflow.fixtures"
]
@pytest.mark.usefixtures("register", "login", "add_piece_repository", "teardown_piece_repository")
class TestWorkflowRouter: 
    @staticmethod
    def test_create_workflow(patch_piece_secret: Response, create_workflow: Response, piece_repository: PieceRepository, user: User):
        mock_response = CreateWorkflowResponse(
            id=1,
            name=workflow_request_model["workflow"]["name"],
            created_at=datetime.utcnow(),
            schema=workflow_request_model['forageSchema'],
            created_by=user.id,
            last_changed_at=datetime.utcnow(),
            last_changed_by=user.id
        )
        response=create_workflow
        content=response.json()
        mock_response_content=json.loads(mock_response.model_dump_json(by_alias=True))

        assert response.status_code == 201
        assert content.keys() == mock_response_content.keys()
        
        assert content.get("name") == mock_response_content.get("name")

        assert content.get("created_by") == mock_response_content.get("created_by")
        assert content.get("last_changed_by") == mock_response_content.get("last_changed_by")


    @staticmethod
    @pytest.mark.skip(reason="Requires a workflow to be created")
    def test_get_workflow(get_workflow: Response, workflow: Workflow, default_workspace: Workspace, user: User):
        mock_response = GetWorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            created_at=workflow.created_at,
            schema=BaseWorkflowModel(
                workflow=WorkflowConfigResponse(
                    name=workflow.name,
                    start_date=str(datetime.utcnow())
                ),
                tasks=dict()
            ),
            ui_schema=BaseUiSchema(
                nodes=dict(),
                edges=list(dict())
            ),
            last_changed_at = datetime.utcnow(),
            last_changed_by = user.id,
            created_by = user.id,
            workspace_id = default_workspace.id
        )

        reponse = get_workflow
        content = get_workflow.json()

        assert reponse.status_code == 200
        assert content.keys() == mock_response.dict(by_alias=True).keys()

    @staticmethod
    def test_delete_workflow(patch_piece_secret: Response, create_workflow: Response, delete_workflow: Response):
        response = delete_workflow
        assert response.status_code == 204
        #TODO assert not found with get workflow

        
