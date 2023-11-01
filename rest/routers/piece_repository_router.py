from fastapi import APIRouter, HTTPException, status, Depends, Response
from services.auth_service import AuthService
from services.piece_repository_service import PieceRepositoryService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.piece_repository import CreateRepositoryRequest, PatchRepositoryRequest, ListRepositoryFilters
from schemas.responses.piece_repository import (
    CreateRepositoryReponse,
    PatchRepositoryResponse,
    GetRepositoryReleasesResponse,
    GetRepositoryReleaseDataResponse,
    GetWorkspaceRepositoriesResponse,
    GetRepositoryResponse
)
from database.models.enums import RepositorySource
from schemas.exceptions.base import BaseException, ConflictException, ForbiddenException, ResourceNotFoundException, UnauthorizedException
from schemas.errors.base import ConflictError, ForbiddenError, ResourceNotFoundError, SomethingWrongError, UnauthorizedError
from typing import List, Optional

router = APIRouter(prefix="/pieces-repositories")
auth_service = AuthService()

piece_repository_service = PieceRepositoryService()

@router.post(
    path="",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': CreateRepositoryReponse},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_409_CONFLICT: {'model': ConflictError},
        status.HTTP_401_UNAUTHORIZED: {'model': UnauthorizedError}
    },
)
def create_piece_repository(
    body: CreateRepositoryRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_owner_access_authorizer_body)
) -> CreateRepositoryReponse:
    """
    Create piece repository for workspace. 
    Only one piece repository version is allowed for each workspace.
    """
    try:
        response = piece_repository_service.create_piece_repository(
            piece_repository_data=body,
            auth_context=auth_context
        )
        return response
    except (BaseException, ForbiddenException, ConflictException, ResourceNotFoundException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    path="/releases",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': List[GetRepositoryReleasesResponse]},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_401_UNAUTHORIZED: {'model': UnauthorizedError}
    },
)
def get_piece_repository_releases(
    source: RepositorySource,
    path: str,
    workspace_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> List[GetRepositoryReleasesResponse]:
    """Get piece repository releases"""
    try:
        response = piece_repository_service.get_piece_repository_releases(
            source=source,
            path=path,
            auth_context=auth_context,
        )
        return response
    except (BaseException, ForbiddenException, ResourceNotFoundException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    path="/releases/{version}",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': GetRepositoryReleaseDataResponse},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_401_UNAUTHORIZED: {'model': UnauthorizedError}
    },
)
def get_piece_repository_release_data(
    version: str,
    source: RepositorySource,
    path: str,
    workspace_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetRepositoryReleaseDataResponse:
    """Get piece repository release data"""
    try:
        response = piece_repository_service.get_piece_repository_release_data(
            version=version,
            source=source,
            path=path,
            auth_context=auth_context,
        )
        return response
    except (BaseException, ForbiddenException, ResourceNotFoundException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    path="",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': GetWorkspaceRepositoriesResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
    },
    # TODO - I commented this to make it easier to test, but we should solve the auth service
    # dependencies=[Depends(auth_service.workspace_access_authorizer)]
)
def get_pieces_repositories(
    workspace_id: int,
    page: Optional[int] = 0,
    page_size: Optional[int] = 100,
    filters: ListRepositoryFilters = Depends(),
) -> GetWorkspaceRepositoriesResponse:
    """Get pieces repositories for workspace"""
    try:
        response = piece_repository_service.get_pieces_repositories(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size,
            filters=filters
        )
        return response
    except (BaseException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete(
    path="/{piece_repository_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_409_CONFLICT: {"model": ConflictError}
    },
)
def delete_repository(
    piece_repository_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.piece_repository_workspace_owner_access_authorizer)
):
    try:
        response =  piece_repository_service.delete_repository(
            piece_repository_id=piece_repository_id
        )
        return response
    except (BaseException, ResourceNotFoundException, ForbiddenException, ConflictException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    path="/{piece_repository_id}",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': GetRepositoryResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },

)
@auth_service.authorize_repository_workspace_access
def get_piece_repository(
    piece_repository_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> GetRepositoryResponse:
    """Get piece repository"""
    try:
        response = piece_repository_service.get_piece_repository(
            piece_repository_id=piece_repository_id
        )
        return response
    except (BaseException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)