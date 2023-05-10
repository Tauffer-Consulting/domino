from fastapi import APIRouter, HTTPException, status, Depends
from services.auth_service import AuthService
from services.piece_service import PieceService
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.piece import ListPiecesFilters
from schemas.responses.piece import GetPiecesResponse
from schemas.exceptions.base import BaseException, ForbiddenException, ResourceNotFoundException
from schemas.errors.base import SomethingWrongError, ForbiddenError
from typing import List


router = APIRouter(prefix="/pieces-repositories/{piece_repository_id}/pieces")

piece_service = PieceService()
auth_service = AuthService()


@router.get(
    path='',
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
    """List pieces for an piece repository in a workspace"""
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