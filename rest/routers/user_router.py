from fastapi import APIRouter, HTTPException, status, Depends

from services.user_service import UserService
from schemas.exceptions.base import BaseException, ForbiddenException, UnauthorizedException
from schemas.errors.base import SomethingWrongError, UnauthorizedError, ForbiddenError
from schemas.context.auth_context import AuthorizationContextData
from services.auth_service import AuthService

router = APIRouter(prefix="/users")

user_service = UserService()
auth_service = AuthService()

@router.delete(
    "/{user_id}",
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_401_UNAUTHORIZED: {"model": UnauthorizedError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError}
    }
)
async def delete_user(
    user_id: int, 
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
):
    """
        Delete user by id.
        The user can only delete himself and should be authenticated.
    """
    try:
        response = await user_service.delete_user(user_id=user_id, auth_context=auth_context)
        return response
    except (BaseException, ForbiddenException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)