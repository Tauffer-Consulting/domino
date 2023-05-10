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
from database.models.enums import Permission
import functools
from typing import Optional, Dict
from cryptography.fernet import Fernet


class AuthService():
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = settings.AUTH_SECRET_KEY
    expire = settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES
    algorithm = settings.AUTH_ALGORITHM
    user_repository = UserRepository()
    workspace_repository = WorkspaceRepository()
    piece_repository_repository = PieceRepositoryRepository()
    github_token_fernet = Fernet(settings.GITHUB_TOKEN_SECRET_KEY)

    @classmethod
    def get_password_hash(cls, password):
        return cls.pwd_context.hash(password)

    @classmethod
    def verify_password(cls, plain_password, hashed_password):
        return cls.pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def encode_token(cls, user_id):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=0, minutes=cls.expire),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            settings.AUTH_SECRET_KEY,
            algorithm=cls.algorithm
        )

    @classmethod
    def decode_token(cls, token):
        try:
            payload = jwt.decode(token, cls.secret, algorithms=[cls.algorithm])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='Signature has expired')
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail='Invalid token')

    @classmethod
    def auth_wrapper(cls, auth: HTTPAuthorizationCredentials = Security(security)):
        user_id = cls.decode_token(auth.credentials)
        return AuthorizationContextData(
            user_id=user_id
        )

    @classmethod
    def authorize_repository_workspace_access(cls, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            repository_id = kwargs.get('piece_repository_id')
            auth_context = kwargs.get('auth_context')
            repository = cls.piece_repository_repository.find_by_id(id=repository_id)
            if not repository:
                raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)
            workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(id=repository.workspace_id, user_id=auth_context.user_id)
            if not workspace_associative_data:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
            return func(*args, **kwargs)
        return wrapper

    @classmethod
    def authorize_repository_workspace_owner_access(cls, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            repository_id = kwargs.get('piece_repository_id')
            auth_context = kwargs.get('auth_context')
            body = kwargs.get('body')
            repository = cls.piece_repository_repository.find_by_id(id=repository_id)
            if not repository:
                raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)
            workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(id=repository.workspace_id, user_id=auth_context.user_id)
            if workspace_associative_data and not workspace_associative_data.permission:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

            if not workspace_associative_data:
                raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)

            if not body or not getattr(body, "workspace_id", None):
                return func(*args, **kwargs)
            if body.workspace_id != repository.workspace_id:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
            return func(*args, **kwargs)
        return wrapper

    @classmethod
    def workspace_access_authorizer(
        cls, 
        workspace_id: Optional[int],
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        auth_context = cls.auth_wrapper(auth)
        if not workspace_id:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
        workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(
            id=workspace_id, 
            user_id=auth_context.user_id
        )
        if workspace_associative_data and not workspace_associative_data.permission:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        if not workspace_associative_data:
            raise HTTPException(
                status_code=ResourceNotFoundError().status_code, 
                detail=ResourceNotFoundError(message='Workspace not found').message
            )

        decoded_github_token = None if not workspace_associative_data.github_access_token else cls.github_token_fernet.decrypt(workspace_associative_data.github_access_token.encode('utf-8')).decode('utf-8')
        auth_context.workspace = WorkspaceAuthorizerData(
            id=workspace_associative_data.workspace_id,
            name=workspace_associative_data.name,
            github_access_token=decoded_github_token,
            user_permission=workspace_associative_data.permission
        )
        return auth_context
    
    @classmethod
    def workspace_owner_access_authorizer_body(
        cls,
        body: Optional[Dict] = None,
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        workspace_id = body.get('workspace_id')
        return cls.workspace_owner_access_authorizer(workspace_id=workspace_id, auth=auth)
   

    @classmethod
    def workspace_owner_access_authorizer(
        cls,
        workspace_id: Optional[int],
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        auth_context = cls.auth_wrapper(auth)
        if not workspace_id:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
        workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(
            id=workspace_id, 
            user_id=auth_context.user_id
        )
        if workspace_associative_data and not workspace_associative_data.permission:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        if not workspace_associative_data:
            raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)

        if workspace_associative_data.permission != Permission.owner.value:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        decoded_github_token = None if not workspace_associative_data.github_access_token else cls.github_token_fernet.decrypt(workspace_associative_data.github_access_token.encode('utf-8')).decode('utf-8')
        auth_context.workspace = WorkspaceAuthorizerData(
            id=workspace_associative_data.workspace_id,
            name=workspace_associative_data.name,
            github_access_token=decoded_github_token,
            user_permission=workspace_associative_data.permission
        )
        return auth_context

    @classmethod
    def piece_repository_workspace_owner_access_authorizer(
        cls,
        piece_repository_id: Optional[int],
        body: Optional[Dict] = None,
        auth: HTTPAuthorizationCredentials = Security(security),
    ):
        if body is None:
            body = {}
        auth_context = cls.auth_wrapper(auth)
        repository = cls.piece_repository_repository.find_by_id(id=piece_repository_id)
        if not repository:
            raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)
        workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(id=repository.workspace_id, user_id=auth_context.user_id)

        if workspace_associative_data and not workspace_associative_data.permission:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

        if not workspace_associative_data:
            raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)

        if not body or not getattr(body, "workspace_id", None):
            return auth_context

        if body.workspace_id != repository.workspace_id:
            raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
        return auth_context

    @classmethod
    def authorize_workspace_access(cls, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            workspace_id = kwargs.get('workspace_id')
            auth_context = kwargs.get('auth_context')
            workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(id=workspace_id, user_id=auth_context.user_id)
            if workspace_associative_data and not workspace_associative_data.permission:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

            if not workspace_associative_data:
                raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)
            return func(*args, **kwargs)
        return wrapper

    @classmethod
    def authorize_workspace_owner_access(cls, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            workspace_id = kwargs.get('workspace_id')
            body = kwargs.get('body')
            if not workspace_id and not body.workspace_id:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

            w_id = workspace_id if workspace_id else body.workspace_id
            auth_context = kwargs.get('auth_context')
            workspace_associative_data = cls.workspace_repository.find_by_id_and_user_id(id=w_id, user_id=auth_context.user_id)
            if workspace_associative_data and not workspace_associative_data.permission:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)

            if not workspace_associative_data:
                raise HTTPException(status_code=ResourceNotFoundError().status_code, detail=ResourceNotFoundError().message)

            if workspace_associative_data.permission != Permission.owner.value:
                raise HTTPException(status_code=ForbiddenError().status_code, detail=ForbiddenError().message)
            return func(*args, **kwargs)
        return wrapper
