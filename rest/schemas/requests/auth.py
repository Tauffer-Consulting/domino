from .base_model import BaseRequestModel
from pydantic import EmailStr, SecretStr


class AuthRegisterRequest(BaseRequestModel):
    email: EmailStr
    password: SecretStr


class AuthLoginRequest(BaseRequestModel):
    email: EmailStr
    password: SecretStr