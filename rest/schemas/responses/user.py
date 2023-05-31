from pydantic import BaseModel


class GetUserInfoResponse(BaseModel):
    user_info = dict