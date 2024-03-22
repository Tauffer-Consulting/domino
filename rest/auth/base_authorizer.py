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


class BaseAuthorizer():
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
        exp = datetime.utcnow() + timedelta(days=0, minutes=cls.expire)
        current_date = datetime.utcnow()
        expires_in = floor((exp - current_date).total_seconds())
        if expires_in >= 120:
            expires_in = expires_in - 120

        payload = {
            'exp': datetime.utcnow() + timedelta(days=0, minutes=cls.expire),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return {
            "token": jwt.encode(
                payload,
                settings.AUTH_SECRET_KEY,
                algorithm=cls.algorithm
            ),
            "expires_in": expires_in
        }

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
