from pydantic import BaseModel, Field


class BadRequestError(BaseModel):
    status_code = 400
    message: str = Field(default="Bad request data")


class SomethingWrongError(BaseModel):
    status_code = 500
    message: str = Field(default="Something went wrong")


class UnauthorizedError(BaseModel):
    status_code = 401
    message: str = Field(default="Unauthorized")


class ForbiddenError(BaseModel):
    status_code = 403
    message: str = Field(default="Forbidden")


class ConflictError(BaseModel):
    status_code = 409
    message: str = Field(default="Conflict")


class ResourceNotFoundError(BaseModel):
    status_code = 404
    message: str = Field(default="Resource not found") 