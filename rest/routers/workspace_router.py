from fastapi import APIRouter, HTTPException, status, Depends, Response
from services.auth_service import AuthService

from services.workspace_service import WorkspaceService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.workspace import CreateWorkspaceRequest, AssignWorkspaceRequest, PatchWorkspaceRequest
from schemas.responses.workspace import (
    CreateWorkspaceResponse, 
    ListUserWorkspacesResponse, 
    AssignWorkspaceResponse, 
    GetWorkspaceResponse, 
    PatchWorkspaceResponse, 
    ListWorkspaceUsersResponse
)
from schemas.exceptions.base import BaseException, ConflictException, ResourceNotFoundException, ForbiddenException, UnauthorizedException
from schemas.errors.base import ConflictError, ForbiddenError, SomethingWrongError, ResourceNotFoundError, UnauthorizedError
from database.models.enums import UserWorkspaceStatus
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
        response = workspace_service.list_active_pending_user_workspaces(
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
        status.HTTP_200_OK: {'model': GetWorkspaceResponse},
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
    "/{workspace_id}/invites",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_204_NO_CONTENT: {'model': None},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_409_CONFLICT: {'model': ConflictError}
    }
)
def add_user_to_workspace(
    workspace_id: int,
    body: AssignWorkspaceRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_owner_access_authorizer)
):
    """Assign workspace to user with permission"""
    try:
        workspace_service.add_user_to_workspace(
            workspace_id=workspace_id,
            body=body
        )
    except (BaseException, ResourceNotFoundException, ConflictException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    

@router.post(
    '/{workspace_id}/invites/accept',
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': GetWorkspaceResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_409_CONFLICT: {'model': ConflictError}
    }
)
def accept_workspace_invite(
    workspace_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> GetWorkspaceResponse:
    """
    Accept workspace invite.
    Each user workspace pair can have only one pending invite.
    """
    try:
        response = workspace_service.handle_invite_action(
            workspace_id=workspace_id,
            auth_context=auth_context,
            action=UserWorkspaceStatus.accepted.value
        )
        return response
    except (BaseException, ResourceNotFoundException, ConflictException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.post(
    '/{workspace_id}/invites/reject',
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': GetWorkspaceResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_409_CONFLICT: {'model': ConflictError}
    }
)
def reject_workspace_invite(
    workspace_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> GetWorkspaceResponse:
    """
    Reject workspace invite.
    Each user workspace pair can have only one pending invite.
    """
    try:
        response = workspace_service.handle_invite_action(
            workspace_id=workspace_id,
            auth_context=auth_context,
            action=UserWorkspaceStatus.rejected.value
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
    

@router.delete(
    path="/{workspace_id}/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
    },
)
async def remove_user_from_workspace(
    workspace_id: int,
    user_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
):
    try:
        await workspace_service.remove_user_from_workspace(
            workspace_id=workspace_id,
            user_id=user_id,
            auth_context=auth_context
        )
    except (BaseException, ResourceNotFoundException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    path="/{workspace_id}/users",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {'model': ListWorkspaceUsersResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
    },
)
def list_workspace_users(
    workspace_id: int,
    page: int = 0,
    page_size: int = 10,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> ListWorkspaceUsersResponse:
    try:
        return workspace_service.list_workspace_users(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size
        )
    except (BaseException, ResourceNotFoundException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

