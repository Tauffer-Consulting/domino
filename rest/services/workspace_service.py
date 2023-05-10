from repository.user_repository import UserRepository
from core.logger import get_configured_logger
from schemas.context.auth_context import AuthorizationContextData, WorkspaceAuthorizerData
from schemas.requests.workspace import CreateWorkspaceRequest, AssignWorkspaceRequest, PatchWorkspaceRequest
from schemas.responses.workspace import (
    WorkspaceBase,
    CreateWorkspaceResponse,
    AssignWorkspaceResponse,
    WorkspaceBase,
    ListUserWorkspacesResponse,
    GetWorkspaceResponse,
    PatchWorkspaceResponse
)
from schemas.requests.piece_repository import CreateRepositoryRequest
from schemas.exceptions.base import ConflictException, ResourceNotFoundException, ForbiddenException, UnauthorizedException
from repository.workspace_repository import WorkspaceRepository
from services.workflow_service import WorkflowService
from services.piece_repository_service import PieceRepositoryService
from repository.user_repository import UserRepository
from database.models import Workspace, UserWorkspaceAssociative
from database.models.enums import Permission
from cryptography.fernet import Fernet
from core.settings import settings
from typing import List

class WorkspaceService(object):

    def __init__(self) -> None:
        self.workspace_repository = WorkspaceRepository()
        self.user_repository = UserRepository()
        self.piece_repository_service = PieceRepositoryService()
        self.logger = get_configured_logger(self.__class__.__name__)
        self.workflow_service = WorkflowService()
        self.github_token_fernet = Fernet(settings.GITHUB_TOKEN_SECRET_KEY)

    def create_workspace(
        self,
        workspace_data: CreateWorkspaceRequest,
        auth_context:AuthorizationContextData = None
    ) -> CreateWorkspaceResponse:
        """Create user group"""
        self.logger.info("Creating workspace")
        workspace = self.workspace_repository.find_by_name_and_user_id(
            name=workspace_data.name,
            user_id=auth_context.user_id
        )
        if workspace:
            raise ConflictException()

        new_workspace = Workspace(
            name=workspace_data.name,
            github_access_token=None
        )
        workspace = self.workspace_repository.create(new_workspace)
        associative = UserWorkspaceAssociative(permission=Permission.owner.value)
        self.user_repository.add_workspace(
            user_id=auth_context.user_id,
            workspace=workspace,
            associative=associative
        )

        try:
            self.piece_repository_service.create_default_storage_repository(
                workspace_id=workspace.id
            )
            auth_context.workspace = WorkspaceAuthorizerData(
                id=workspace.id,
                name=workspace.name,
                github_access_token=None,
                user_permission=Permission.owner.value
            )

            self.piece_repository_service.create_piece_repository(
                piece_repository_data=CreateRepositoryRequest(
                    workspace_id=workspace.id,
                    source=settings.DOMINO_DEFAULT_PIECES_REPOSITORY_SOURCE,
                    path=settings.DOMINO_DEFAULT_PIECES_REPOSITORY,
                    version=settings.DOMINO_DEFAULT_PIECES_REPOSITORY_VERSION
                ),
                auth_context=auth_context
            )
            return CreateWorkspaceResponse(id=workspace.id, name=workspace.name)
        except (BaseException, ForbiddenException, UnauthorizedException, ResourceNotFoundException) as e:
            self.logger.exception(e)
            self.workspace_repository.delete(id=workspace.id)
            raise e
    
    def patch_workspace(self, workspace_id: int, workspace_data: PatchWorkspaceRequest, auth_context: AuthorizationContextData):
        self.logger.info("Patch workspace")
        _workspace = self.workspace_repository.find_by_id_and_user(
            id=workspace_id,
            user_id=auth_context.user_id
        )
        if not _workspace:
            raise ResourceNotFoundException()
        workspace = Workspace(
            id=_workspace.id,
            name=_workspace.name,
            github_access_token=None
        )
        decoded_encrypted_secret = None
        if workspace_data.github_access_token:
            encrypted_secret = self.github_token_fernet.encrypt(
                data=workspace_data.github_access_token.encode('utf-8')
            )
            decoded_encrypted_secret = encrypted_secret.decode('utf-8')
        workspace.github_access_token = decoded_encrypted_secret
        self.workspace_repository.update(workspace)
        return PatchWorkspaceResponse(
            id=workspace.id, 
            workspace_name=workspace.name,
            github_access_token_filled=workspace.github_access_token is not None,
            user_permission=_workspace.permission
        )

    def list_user_workspaces(self, page: int, page_size: int, auth_context: AuthorizationContextData) -> List[ListUserWorkspacesResponse]:
        """List user workspaces"""
        self.logger.info("Listing user workspaces")
        workspaces = self.workspace_repository.find_by_user_id(
            user_id=auth_context.user_id,
            page=page,
            page_size=page_size
        )
        # TODO add pagination metadata
        response = [
            ListUserWorkspacesResponse(
                id=workspace.id,
                workspace_name=workspace.name,
                user_permission=permission,
                github_access_token_filled=workspace.github_access_token is not None
            )
            for workspace, permission in workspaces
        ]
        return response

    def get_workspace_data(self, workspace_id: int, auth_context: AuthorizationContextData) -> GetWorkspaceResponse:
        """Get workspace data"""
        self.logger.info(f"Getting workspace data for workspace {workspace_id}")

        workspace = self.workspace_repository.find_by_id_and_user(workspace_id, user_id=auth_context.user_id)
        if not workspace:
            raise ResourceNotFoundException()

        response = GetWorkspaceResponse(
            id=workspace.id,
            workspace_name=workspace.name,
            user_permission=workspace.permission.value,
            github_access_token_filled=workspace.github_access_token is not None
        )
        return response

    def add_user_to_workspace(
        self,
        user_id: int,
        workspace_id: int,
        body: AssignWorkspaceRequest
    ):
        """Assign workspace to user"""
        self.logger.info(f"Assigning workspace {workspace_id} to user {user_id}")

        user = self.user_repository.find_by_id(user_id)
        for workspace_assoc in user.workspaces:
            if workspace_assoc.workspace.id == workspace_id:
                raise ConflictException()

        workspace = self.workspace_repository.find_by_id(id=workspace_id)
        updated_user = self.user_repository.add_workspace(
            user_id=user_id,
            workspace=workspace,
            associative=UserWorkspaceAssociative(permission=body.permission.value)
        )
        response = AssignWorkspaceResponse(
            user_id=updated_user.id,
            workspaces=[
                WorkspaceBase(
                    workspace_id=workspace_assoc.workspace.id,
                    workspace_name=workspace_assoc.workspace.name,
                    user_permission=workspace_assoc.permission
                )
                for workspace_assoc in updated_user.workspaces
            ]
        )
        return response
    
    async def delete_workspace(self, workspace_id: int):
        workspace = self.workspace_repository.find_by_id(id=workspace_id)
        if not workspace:
            raise ResourceNotFoundException()

        try:
            await self.workflow_service.delete_workspace_workflows(
                workspace_id=workspace_id,
            )
            self.workspace_repository.delete(id=workspace_id)
        except Exception as e:
            self.logger.exception(e)
            self.workspace_repository.delete(id=workspace_id)