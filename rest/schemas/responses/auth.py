from pydantic import BaseModel
from typing import List


class LoginResponse(BaseModel):
    user_id: int
    email: str
    workspaces_ids: List[int]
    access_token: str
    token_expires_in: int

class RegisterResponse(BaseModel):
    user_id: int
    email: str
    workspaces_ids: List[int]
    access_token: str
    token_expires_in: int
