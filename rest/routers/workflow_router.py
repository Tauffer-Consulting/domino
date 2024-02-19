from fastapi import APIRouter, HTTPException, status, Depends, Response
from schemas.context.auth_context import AuthorizationContextData
from typing import List
from services.workflow_service import WorkflowService
from services.auth_service import AuthService
from schemas.requests.workflow import CreateWorkflowRequest, ListWorkflowsFilters
from schemas.responses.workflow import (
    GetWorkflowsResponse,
    GetWorkflowResponse,
    CreateWorkflowResponse,
    GetWorkflowRunsResponse,
    GetWorkflowRunTasksResponse,
    GetWorkflowRunTaskLogsResponse,
    GetWorkflowRunTaskResultResponse,
    GetWorkflowResultReportResponse,
)
from schemas.exceptions.base import (
    BaseException,
    ConflictException,
    ForbiddenException,
    ResourceNotFoundException,
    UnauthorizedException,
    BadRequestException
)
from schemas.errors.base import (
    ConflictError,
    ForbiddenError,
    ResourceNotFoundError,
    SomethingWrongError,
)


router = APIRouter(prefix="/workspaces/{workspace_id}/workflows")
auth_service = AuthService()
workflow_service = WorkflowService()


@router.post(
    path="",
    status_code=201,
    responses={
        status.HTTP_201_CREATED: {"model": CreateWorkflowResponse},
        status.HTTP_409_CONFLICT: {"model": ConflictError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
)
def create_workflow(
    workspace_id: int,
    body: CreateWorkflowRequest,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> CreateWorkflowResponse:
    """Create a new workflow"""
    try:
        return workflow_service.create_workflow(
            workspace_id=workspace_id,
            body=body,
            auth_context=auth_context
        )
    except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException, BadRequestException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    path="",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": List[GetWorkflowsResponse]},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
    },
    dependencies=[Depends(auth_service.workspace_access_authorizer)]
)
async def list_workflows(
    workspace_id: int,
    page: int = 0,
    page_size: int = 5,
    filters: ListWorkflowsFilters = Depends(),
) -> GetWorkflowsResponse:
    """List all workflows with its basic information"""
    try:
        return await workflow_service.list_workflows(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size,
            filters=filters
        )
    except (BaseException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/{workflow_id}",
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
    status_code=200,
)
@auth_service.authorize_workspace_access
def get_workflow(
    workspace_id: int,
    workflow_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
) -> GetWorkflowResponse:
    """Get a workflow information"""
    try:
        return workflow_service.get_workflow(
            workspace_id=workspace_id,
            workflow_id=workflow_id,
            auth_context=auth_context
        )
    except (BaseException, UnauthorizedException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.delete(
    "/{workflow_id}",
    status_code=204,
    response_class=Response,
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    },
    dependencies=[Depends(auth_service.workspace_owner_access_authorizer)]
)
async def delete_workflow(
    workspace_id: int,
    workflow_id: int,
):
    try:
        return await workflow_service.delete_workflow(
            workflow_id=workflow_id,
            workspace_id=workspace_id
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)



@router.post(
    "/{workflow_id}/runs",
    status_code=204,
    responses={
        status.HTTP_204_NO_CONTENT: {},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def run_workflow(
    workspace_id: int,
    workflow_id: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
):
    try:
        return workflow_service.run_workflow(
            workflow_id=workflow_id
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException, ConflictException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    "/{workflow_id}/runs",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowRunsResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def list_workflow_runs(
    workspace_id: int,
    workflow_id: int,
    page: int = 0,
    page_size: int = 5,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetWorkflowRunsResponse:
    try:
        return workflow_service.list_workflow_runs(
            workflow_id=workflow_id,
            page=page,
            page_size=page_size
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    "/{workflow_id}/runs/{workflow_run_id}/tasks",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowRunTasksResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def list_run_tasks(
    workspace_id: int,
    workflow_id: int,
    workflow_run_id: str,
    page: int = 0,
    page_size: int = 5,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetWorkflowRunTasksResponse:
    try:
        return workflow_service.list_run_tasks(
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
            page=page,
            page_size=page_size
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    "/{workflow_id}/runs/{workflow_run_id}/tasks/report",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowResultReportResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def generate_report(
    workspace_id: int,
    workflow_id: int,
    workflow_run_id: str,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetWorkflowResultReportResponse:
    try:
        return workflow_service.generate_report(
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    "/{workflow_id}/runs/{workflow_run_id}/tasks/{task_id}/{task_try_number}/logs",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowRunTaskLogsResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def get_task_logs(
    workspace_id: int,
    workflow_id: int,
    workflow_run_id: str,
    task_id: str,
    task_try_number: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetWorkflowRunTaskLogsResponse:

    """
    Get workflow run task parsed logs lines.
    """
    try:
        return workflow_service.get_task_logs(
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
            task_id=task_id,
            task_try_number=task_try_number
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/{workflow_id}/runs/{workflow_run_id}/tasks/{task_id}/{task_try_number}/result",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetWorkflowRunTaskResultResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_403_FORBIDDEN: {"model": ForbiddenError},
        status.HTTP_404_NOT_FOUND: {"model": ResourceNotFoundError}
    }
)
def get_task_result(
    workspace_id: int,
    workflow_id: int,
    workflow_run_id: str,
    task_id: str,
    task_try_number: int,
    auth_context: AuthorizationContextData = Depends(auth_service.workspace_access_authorizer)
) -> GetWorkflowRunTaskResultResponse:

    """
    Get workflow run task parsed logs lines.
    """
    try:
        return workflow_service.get_task_result(
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
            task_id=task_id,
            task_try_number=task_try_number
        )
    except (BaseException, ForbiddenException, ResourceNotFoundException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)