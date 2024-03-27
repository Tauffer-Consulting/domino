from fastapi import APIRouter, HTTPException, Depends, status
from services.secret_service import SecretService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.secret import PatchSecretValueRequest
from schemas.responses.secret import ListRepositorySecretsResponse, GetSecretsByPieceResponse
from schemas.exceptions.base import BaseException, ForbiddenException, ResourceNotFoundException
from schemas.errors.base import ResourceNotFoundError, SomethingWrongError, ForbiddenError
from typing import List
from auth.permission_authorizer import Authorizer
from database.models.enums import Permission


router = APIRouter(prefix="/pieces-repositories/{piece_repository_id}/secrets")

secret_service = SecretService()

read_authorizer = Authorizer(permission_level=Permission.read.value)
admin_authorizer = Authorizer(permission_level=Permission.admin.value)



@router.get(
    '',
    status_code=200,
    responses={
        status.HTTP_200_OK: {'model': ListRepositorySecretsResponse},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError}
    }
)
def get_repository_secrets(
    piece_repository_id: int,
    auth_context: AuthorizationContextData = Depends(read_authorizer.authorize_piece_repository)
) -> List[ListRepositorySecretsResponse]:
    """
        Get the list of piece repository secrets.
        User must have access to the workspace the piece repository belongs to.
    """
    try:
        response = secret_service.get_repository_secrets(
            piece_repository_id=piece_repository_id
        )
        return response
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.patch(
    '/{secret_id}',
    status_code=204,
    responses={
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    }
)
def update_repository_secret(
    piece_repository_id: int,
    secret_id: int,
    body: PatchSecretValueRequest,
    auth_context: AuthorizationContextData = Depends(admin_authorizer.authorize_piece_repository)
):
    """
        Update an piece repository secret value.
        User must have owner access to the workspace the piece repository belongs to.
    """
    try:
        secret_service.update_repository_secret(
            piece_repository_id=piece_repository_id,
            secret_id=secret_id,
            body=body
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    path='/{piece_name}/secrets-values', # using sufix /secrets-values only because istio does not support wildcards in paths
    status_code=200,
    responses={
        status.HTTP_200_OK: {'model': List[GetSecretsByPieceResponse]},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError}
    },
    include_in_schema=False
)
def get_piece_secrets(
    piece_repository_id: int,
    piece_name: str,
) -> List[GetSecretsByPieceResponse]:
    """
    Get secrets values for a specific Piece from an piece repository, in a specific workspace
    This endpoint is not using authorization service because it is used by airflow to get secrets values
    In production this endpoint should be blocked from external access using security strategies like authorization policies.
    """
    try:
        response = secret_service.get_piece_secrets(
            piece_repository_id=piece_repository_id,
            piece_name=piece_name
        )
        return response
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

