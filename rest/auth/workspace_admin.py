from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from schemas.errors.base import ForbiddenError, ResourceNotFoundError
from core.settings import settings
from schemas.context.auth_context import AuthorizationContextData, WorkspaceAuthorizerData
from repository.user_repository import UserRepository
from repository.workspace_repository import WorkspaceRepository
from repository.piece_repository_repository import PieceRepositoryRepository
from database.models.enums import Permission, UserWorkspaceStatus
import functools
from typing import Optional, Dict
from cryptography.fernet import Fernet
from math import floor
from auth.base_authorizer import BaseAuthorizer



class WorkspaceAdminAuthorizer(BaseAuthorizer):
    security = HTTPBearer()
    def __init__(self):
        super().__init__()

    def authorize(
        self,
        workspace_id: Optional[int],
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        """
        Authorizer admin level or more
        """
        auth_context = self.auth_wrapper(auth)
        if not workspace_id:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
        workspace_associative_data = self.workspace_repository.find_by_id_and_user_id(
            id=workspace_id,
            user_id=auth_context.user_id
        )
        if not workspace_associative_data:
            raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)

        if workspace_associative_data and not workspace_associative_data.permission:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        if workspace_associative_data and workspace_associative_data.status != UserWorkspaceStatus.accepted.value:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        if workspace_associative_data.permission.value not in [Permission.admin.value, Permission.owner.value]:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        decoded_github_token = None if not workspace_associative_data.github_access_token else self.github_token_fernet.decrypt(workspace_associative_data.github_access_token.encode('utf-8')).decode('utf-8')
        auth_context.workspace = WorkspaceAuthorizerData(
            id=workspace_associative_data.workspace_id,
            name=workspace_associative_data.name,
            github_access_token=decoded_github_token,
            user_permission=workspace_associative_data.permission
        )
        return auth_context

    def authorize_with_body(
        self,
        body: Optional[Dict] = None,
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        workspace_id = body.get('workspace_id')
        return self.authorize(workspace_id=workspace_id, auth=auth)