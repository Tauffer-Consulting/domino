from pydantic import BaseModel
from typing import List

# # Base Models
# class UserGroupBase(BaseModel):
#     group_id: int
#     group_name: str

# Responses Models
class LoginResponse(BaseModel):
    user_id: int
    workspaces_ids: List[int]
    access_token: str

class RegisterResponse(BaseModel):
    id: int
    email: str
    workspaces_ids: List[int]
    access_token: str
