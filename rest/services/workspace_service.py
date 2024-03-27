from repository.user_repository import UserRepository
from core.logger import get_configured_logger
from schemas.context.auth_context import AuthorizationContextData, WorkspaceAuthorizerData
from schemas.requests.workspace import CreateWorkspaceRequest, AssignWorkspaceRequest, PatchWorkspaceRequest
from schemas.responses.workspace import (
    CreateWorkspaceResponse,
    ListUserWorkspacesResponse,
    GetWorkspaceResponse,
    PatchWorkspaceResponse,
    ListWorkspaceUsersResponseData,
    ListWorkspaceUsersResponse,
)
from schemas.responses.base import PaginationSet
from schemas.requests.piece_repository import CreateRepositoryRequest
from schemas.exceptions.base import ConflictException, ResourceNotFoundException, ForbiddenException, UnauthorizedException
from repository.workspace_repository import WorkspaceRepository
from services.workflow_service import WorkflowService
from services.piece_repository_service import PieceRepositoryService
from repository.user_repository import UserRepository
from database.models import Workspace, UserWorkspaceAssociative
from database.models.enums import Permission, UserWorkspaceStatus
from cryptography.fernet import Fernet
from core.settings import settings
from typing import List
from math import ceil
import threading

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
        associative = UserWorkspaceAssociative(
            permission=Permission.owner.value,
            status=UserWorkspaceStatus.accepted.value
        )
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
            threads = []
            for repo in settings.DEFAULT_REPOSITORIES_LIST:
                if not settings.DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN and repo.get('require_token'):
                    self.logger.info(f'Not installing default repository {repo.get("path")} because it requires a token and no token was provided.')
                    continue

                thread = threading.Thread(
                    target=self.piece_repository_service.create_piece_repository, kwargs=dict(
                        piece_repository_data=CreateRepositoryRequest(
                            workspace_id=workspace.id,
                            source=repo.get('source'),
                            path=repo.get('path'),
                            version=repo.get('version'),
                            url=repo.get('url')
                        ),
                        auth_context=auth_context
                    )
                )
                thread.start()
                threads.append(thread)

            for thread in threads:
                thread.join()

            return CreateWorkspaceResponse(
                id=workspace.id,
                name=workspace.name,
                user_permission=associative.permission,
            )
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
            status=_workspace.status,
            user_permission=_workspace.permission
        )

    def list_active_pending_user_workspaces(self, page: int, page_size: int, auth_context: AuthorizationContextData) -> List[ListUserWorkspacesResponse]:
        """List user workspaces"""
        self.logger.info("Listing user workspaces")
        workspaces = self.workspace_repository.find_by_user_id(
            user_id=auth_context.user_id,
            page=page,
            page_size=page_size,
            return_rejected=False
        )
        # TODO add pagination metadata
        response = [
            ListUserWorkspacesResponse(
                id=workspace.id,
                workspace_name=workspace.name,
                user_permission=permission,
                status=status,
                github_access_token_filled=workspace.github_access_token is not None
            )
            for workspace, permission, status in workspaces
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
            status=workspace.status,
            github_access_token_filled=workspace.github_access_token is not None
        )
        return response

    def add_user_to_workspace(
        self,
        workspace_id: int,
        body: AssignWorkspaceRequest
    ):
        """Assign workspace to user"""
        self.logger.info(f"Assigning workspace {workspace_id} to user {body.user_email}")

        user = self.user_repository.get_user_by_email(body.user_email)
        if not user:
            raise ResourceNotFoundException('User email not found.')

        if body.permission.value == Permission.owner.value:
            raise ConflictException('Cannot assign owner permission to user.')

        for workspace_assoc in user.workspaces:
            if workspace_assoc.workspace.id == workspace_id and workspace_assoc.status == UserWorkspaceStatus.pending.value:
                raise ConflictException('User already invited to this workspace.')
            elif workspace_assoc.workspace.id == workspace_id and workspace_assoc.status == UserWorkspaceStatus.accepted.value:
                raise ConflictException('User already in this workspace.')
            elif workspace_assoc.workspace.id == workspace_id and workspace_assoc.status == UserWorkspaceStatus.rejected.value:
                workspace_assoc.status = UserWorkspaceStatus.pending.value
                self.workspace_repository.update_user_workspace_associative_by_ids(workspace_assoc)
                return

        workspace = self.workspace_repository.find_by_id(id=workspace_id)
        self.user_repository.add_workspace(
            user_id=user.id,
            workspace=workspace,
            associative=UserWorkspaceAssociative(
                permission=body.permission.value,
                status=UserWorkspaceStatus.pending.value
            )
        )

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

    def handle_invite_action(self, workspace_id: int, auth_context: AuthorizationContextData, action: UserWorkspaceStatus):
        _workspace = self.workspace_repository.find_pending_workspace_invite(
            user_id=auth_context.user_id,
            workspace_id=workspace_id
        )
        if not _workspace:
            raise ResourceNotFoundException('Workspace invite not found.')

        workspace = _workspace.Workspace
        associative = _workspace.UserWorkspaceAssociative

        if action == UserWorkspaceStatus.accepted.value:
            associative.status = UserWorkspaceStatus.accepted.value
        elif action == UserWorkspaceStatus.rejected.value:
            associative.status = UserWorkspaceStatus.rejected.value
        else:
            raise BaseException('Invalid action.')

        updated_associative = self.workspace_repository.update_user_workspace_associative_by_ids(associative)
        if not updated_associative:
            raise ResourceNotFoundException('Workspace invite not found.')

        response = GetWorkspaceResponse(
            id=workspace.id,
            workspace_name=workspace.name,
            user_permission=updated_associative.permission,
            status=updated_associative.status,
            github_access_token_filled=workspace.github_access_token is not None
        )
        return response

    async def remove_user_from_workspace(self, workspace_id: int, user_id: int, auth_context: AuthorizationContextData):

        workspace_infos = self.workspace_repository.find_user_workspaces_members_owners_count(
            user_id=user_id,
            workspaces_ids=[workspace_id]
        )

        if not workspace_infos:
            raise ResourceNotFoundException('User not found in workspace.')

        workspace_info = workspace_infos[0]
        workflows_count = workspace_info.total_workflows

        if workspace_info.permission == Permission.owner.value:
            raise ForbiddenException('Cannot remove owner from workspace.')

        if workspace_info.members_count == 1 and workflows_count > 0:
            raise ForbiddenException('Cannot remove last user from workspace with workflows.')

        # If the workspace has only one member (the user) delete the workspace (even the user not being the owner).
        if workspace_info.members_count == 1:
            await self.delete_workspace(workspace_id=workspace_id)
            return

        # If the user is owner and the workspace has only one owner (the user) but has more than one member, delete the workspace.
        # DEPRECATED now we cant remove owners from workspace, owners can only delete workspaces (would be the same action as this one)
        # if workspace_info.owners_count == 1 and auth_context.user_id == user_id and auth_context.workspace.user_permission == Permission.owner.value:
        #     await self.delete_workspace(workspace_id=workspace_id)

        # If the user is admin/owner but is deleting another user, just remove the user from workspace
        # If user is read/write and workspace has more than one member, just remove the user from workspace
        self.workspace_repository.remove_user_from_workspaces(
            workspaces_ids=[workspace_id],
            user_id=user_id
        )

    def list_workspace_users(self, workspace_id: int, page: int, page_size: int):
        # List workspace users
        self.logger.info(f"Listing workspace {workspace_id} users")

        workspace = self.workspace_repository.find_by_id(id=workspace_id)
        if not workspace:
            raise ResourceNotFoundException("Workspace not found.")

        workspace_users_data = self.workspace_repository.find_workspace_users(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size
        )

        count = workspace_users_data[0].count if workspace_users_data else 0
        response_metadata = PaginationSet(
            page=page,
            records=len(workspace_users_data),
            total=count,
            last_page=max(0, ceil(count / page_size) - 1)
        )

        response_data = []
        for workspace_user_data in workspace_users_data:
            response_data.append(
                ListWorkspaceUsersResponseData(
                    user_id=workspace_user_data.User.id,
                    user_email=workspace_user_data.User.email,
                    user_permission=workspace_user_data.UserWorkspaceAssociative.permission,
                    status=workspace_user_data.UserWorkspaceAssociative.status.value
                )
            )

        return ListWorkspaceUsersResponse(
            data=response_data,
            metadata=response_metadata
        )

