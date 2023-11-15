from fastapi import APIRouter, HTTPException, status, Depends
from services.auth_service import AuthService
from services.piece_service import PieceService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.piece import ListPiecesFilters, CreatePieceRequest
from schemas.responses.piece import GetPiecesResponse
from schemas.exceptions.base import BaseException, ForbiddenException, ResourceNotFoundException, BadRequestException, ConflictException
from schemas.errors.base import SomethingWrongError, ForbiddenError, ConflictError, ResourceNotFoundError
from typing import List


# router = APIRouter(prefix="/pieces-repositories/{piece_repository_id}/pieces")
router = APIRouter(prefix="/pieces-repositories")

piece_service = PieceService()
auth_service = AuthService()

@router.post(
    path="/{workspace_id}/pieces",
    status_code=201,
    responses={
        status.HTTP_201_CREATED: {"model": GetPiecesResponse},
        status.HTTP_409_CONFLICT: {"model": ConflictError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
)
# @auth_service.authorize_repository_workspace_access
def create_piece(
    workspace_id: int,
    body: CreatePieceRequest,
    # auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
):
    """Create a piece in a piece repository in a workspace"""
    print('body', body)
    try:
        response = piece_service.create_piece(
            workspace_id=workspace_id,
            body=body
        )
        return response
    except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException, BadRequestException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    path='/{piece_repository_id}/pieces',
    status_code=200,
    responses={
        status.HTTP_200_OK: {'model': List[GetPiecesResponse]},
        status.HTTP_403_FORBIDDEN: {'model': ForbiddenError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {'model': SomethingWrongError}
    }
)
@auth_service.authorize_repository_workspace_access
def get_pieces(
    piece_repository_id: int,
    page: int = 0,
    page_size: int = 100,
    filters: ListPiecesFilters = Depends(),
    auth_context: AuthorizationContextData = Depends(auth_service.auth_wrapper)
):
    """List pieces in a piece repository in a workspace"""
    try:
        response = piece_service.list_pieces(
            piece_repository_id=piece_repository_id,
            page=page,
            page_size=page_size,
            filters=filters
        )
        return response
    except (BaseException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)