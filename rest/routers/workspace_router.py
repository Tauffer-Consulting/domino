from fastapi import APIRouter, HTTPException, status, Depends, Response
from services.auth_service import AuthService

from services.workspace_service import WorkspaceService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.workspace import CreateWorkspaceRequest, AssignWorkspaceRequest, PatchWorkspaceRequest
from schemas.responses.workspace import CreateWorkspaceResponse, ListUserWorkspacesResponse, AssignWorkspaceResponse, GetWorkspaceResponse, PatchWorkspaceResponse
from schemas.exceptions.base import BaseException, ConflictException, ResourceNotFoundException, ForbiddenException, UnauthorizedException
from schemas.errors.base import ConflictError, ForbiddenError, SomethingWrongError, ResourceNotFoundError, UnauthorizedError
from typing import List


router = APIRouter(prefix="/workspaces")
auth_service = AuthService()

workspace_service = WorkspaceService()


@router.post(
    path="",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': CreateWorkspaceResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_401_UNAUTHORIZED: {'model': UnauthorizedError},
        status.HTTP_409_CONFLICT: {'model': ConflictError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError}
    }
)
def create_workspace(
    body: CreateWorkspaceRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> CreateWorkspaceResponse:
    """Create workspace"""
    try:
        response = workspace_service.create_workspace(
            workspace_data=body,
            auth_context=auth_context,
        )
        return response
    except (BaseException, ConflictException, ForbiddenException, UnauthorizedException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': List[ListUserWorkspacesResponse]},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    }
)
def list_user_workspaces(
    page: int = 0,
    page_size: int = 10,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> List[ListUserWorkspacesResponse]:
    """List user workspaces summary"""
    try:
        response = workspace_service.list_user_workspaces(
            page=page,
            page_size=page_size,
            auth_context=auth_context
        )
        return response
    except (BaseException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/{workspace_id}",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': List[ListUserWorkspacesResponse]},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
)
def get_workspace(workspace_id: int, auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)) -> GetWorkspaceResponse:
    """Get specific workspace data. Includes users, workflows and repositories"""
    try:
        response = workspace_service.get_workspace_data(workspace_id=workspace_id, auth_context=auth_context)
        return response
    except (BaseException, ResourceNotFoundException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post(
    "/{user_id}/{workspace_id}",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': AssignWorkspaceResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_409_CONFLICT: {'model': ConflictError}
    }
)
@auth_service.authorize_workspace_owner_access
def add_user_to_workspace(
    user_id: int,
    workspace_id: int,
    body: AssignWorkspaceRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> AssignWorkspaceResponse:
    """Assign workspace to user with permission"""
    try:
        response = workspace_service.add_user_to_workspace(
            user_id=user_id,
            workspace_id=workspace_id,
            body=body
        )
        return response
    except (BaseException, ResourceNotFoundException, ConflictException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete(
    path="/{workspace_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_409_CONFLICT: {'model': ConflictError}
    },
    dependencies=[Depends(auth_service.workspace_owner_access_authorizer)]
)
async def delete_workspace(
    workspace_id: int,
):
    try:
        response = await workspace_service.delete_workspace(
            workspace_id=workspace_id,
        )
        return response
    except (BaseException, ResourceNotFoundException, ConflictException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    

@router.patch(
    path="/{workspace_id}",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': PatchWorkspaceResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
    },
)
def patch_workspace(
    workspace_id: int,
    body: PatchWorkspaceRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_owner_access_authorizer)
):
    try:
        response = workspace_service.patch_workspace(
            workspace_id=workspace_id,
            workspace_data=body,
            auth_context=auth_context
        )
        return response
    except (BaseException, ResourceNotFoundException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)