from fastapi import APIRouter, HTTPException, status
from core.logger import get_configured_logger
from services.auth_service import AuthService
from services.user_service import UserService
from schemas.requests.auth import AuthRegisterRequest, AuthLoginRequest
from schemas.responses.auth import RegisterResponse, LoginResponse
from schemas.exceptions.base import BaseException, ConflictException, UnauthorizedException, ForbiddenException, UnauthorizedException
from schemas.errors.base import ConflictError, SomethingWrongError, UnauthorizedError


router = APIRouter(prefix="/auth")

auth_service = AuthService()
user_service = UserService()

logger = get_configured_logger('auth-router')

@router.post(
    "/register",
    status_code=201,
    responses={
        status.HTTP_201_CREATED: {"model": RegisterResponse},
        status.HTTP_409_CONFLICT: {"model": ConflictError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
    },
)
async def register(auth_details: AuthRegisterRequest) -> RegisterResponse:
    """Register a new user"""
    logger.info('Registering a new user')
    try:
        response = await user_service.create_user(
            email=auth_details.email, password=auth_details.password
        )
        return response
    except (BaseException, ConflictException, ForbiddenException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post(
    "/login",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": LoginResponse},
        status.HTTP_401_UNAUTHORIZED: {"model": UnauthorizedError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
    },
)
def login(auth_details: AuthLoginRequest) -> LoginResponse:
    """Login an user"""
    try:
        response = user_service.login_user(
            email=auth_details.email, password=auth_details.password
        )
        return response
    except (BaseException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)