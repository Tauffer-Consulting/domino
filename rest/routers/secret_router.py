from fastapi import APIRouter, HTTPException, Depends, status
from services.auth_service import AuthService
from services.secret_service import SecretService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.secret import PatchSecretValueRequest
from schemas.responses.secret import ListRepositorySecretsResponse, GetSecretsByPieceResponse
from schemas.exceptions.base import BaseException, ForbiddenException, ResourceNotFoundException
from schemas.errors.base import ResourceNotFoundError, SomethingWrongError, ForbiddenError
from typing import List


router = APIRouter(prefix="/pieces-repositories/{piece_repository_id}/secrets")

auth_service = AuthService()
secret_service = SecretService()

@router.get(
    '',
    status_code=200,
    responses={
        status.HTTP_200_OK: {'model': ListRepositorySecretsResponse},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError}
    }
)
@auth_service.authorize_repository_workspace_access
def get_repository_secrets(
    piece_repository_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
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
@auth_service.authorize_repository_workspace_owner_access # To update a secret user must have owner access to workspace
def update_repository_secret(
    piece_repository_id: int,
    secret_id: int,
    body: PatchSecretValueRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
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

