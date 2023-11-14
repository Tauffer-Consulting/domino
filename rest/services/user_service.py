import asyncio
from core.logger import get_configured_logger
from repository.user_repository import UserRepository
from repository.workspace_repository import WorkspaceRepository
from schemas.requests.workspace import CreateWorkspaceRequest
from schemas.context.auth_context import AuthorizationContextData
from schemas.exceptions.base import ConflictException, UnauthorizedException, ForbiddenException, ResourceNotFoundException
from schemas.responses.auth import RegisterResponse, LoginResponse
from database.models.user import User
from services.auth_service import AuthService
from services.workspace_service import WorkspaceService
from services.piece_repository_service import PieceRepositoryService
from database.models.enums import Permission


class UserService(object):
    def __init__(self) -> None:
        self.user_repository = UserRepository()
        self.auth_service = AuthService()
        self.workspace_repository = WorkspaceRepository()
        self.piece_repository_service = PieceRepositoryService()
        self.workspace_service = WorkspaceService()
        self.logger = get_configured_logger(self.__class__.__name__)

    async def create_user(self, email: str, password: str):
        if self.user_repository.get_user_by_email(email=email):
            raise ConflictException()

        hashed_password = self.auth_service.get_password_hash(password=password.get_secret_value().strip())
        new_user = User(
            email=email.strip(),
            password=hashed_password
        )
        user = self.user_repository.create(user=new_user)
        auth_context = AuthorizationContextData(user_id=user.id, workspace=None)

        try:
            user_default_workspace = self.workspace_service.create_workspace(
                workspace_data=CreateWorkspaceRequest(
                    name=f'Default',
                ),
                auth_context=auth_context
            )
            user_default_workspace_id = user_default_workspace.id

            response = RegisterResponse(
                id=user.id,
                email=user.email,
                access_token=self.auth_service.encode_token(user_id=user.id),
                workspaces_ids=[user_default_workspace_id]
            )

            return response
        except (BaseException, ForbiddenException, UnauthorizedException, ResourceNotFoundException) as e:
            self.logger.exception(e)
            await self.delete_user(user_id=user.id, auth_context=auth_context)
            raise e

    def get_user_info(self, user_id: str):
        # TODO
        return self.user_repository.get_user_by_id(id=user_id)

    def login_user(self, email: str, password: str) -> LoginResponse:
        user = self.user_repository.get_user_by_email(email=email)
        if not user:
            raise UnauthorizedException()

        if not self.auth_service.verify_password(password.get_secret_value(), user.password):
            raise UnauthorizedException()

        token = self.auth_service.encode_token(user_id=user.id)
        return LoginResponse(access_token=token, user_id=user.id, workspaces_ids=[workspace.workspace.id for workspace in user.workspaces])

    async def delete_user(self, user_id: int, auth_context: AuthorizationContextData) -> None:
        self.logger.info(f"Deleting user with id: {user_id}")
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise ResourceNotFoundException()

        if user.id != auth_context.user_id:
            raise ForbiddenException()

        workspaces_ids = [workspace.workspace.id for workspace in user.workspaces]
        user_workspaces_members_count = self.workspace_repository.find_user_workspaces_members_count(
            user_id=user_id,
            workspaces_ids=workspaces_ids
        )

        workspaces_ids_to_delete = list()
        workspaces_ids_to_remove_association = list()
        for workspace_data in user_workspaces_members_count:
            if (workspace_data.members_count == 1) or (workspace_data.members_count > 1 and workspace_data.permission == Permission.owner.value):
                workspaces_ids_to_delete.append(workspace_data.workspace_id)
                continue
            workspaces_ids_to_remove_association.append(workspace_data.workspace_id)

        await asyncio.gather(*[self.workspace_service.delete_workspace(workspace_id=workspace_id) for workspace_id in workspaces_ids_to_delete])

        self.workspace_repository.remove_user_from_workspaces(user_id=user_id, workspaces_ids=workspaces_ids_to_remove_association)
        self.user_repository.delete(user_id=user_id)

        return None
