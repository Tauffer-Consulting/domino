from fastapi import APIRouter, HTTPException, status, Depends, Response
from typing import List
from services.assembled_piece_service import AssembledPieceService
from services.auth_service import AuthService
from schemas.requests.assembled_piece import CreateAssembledPieceRequest, ListAssembledPiecesFilters
from schemas.responses.assembled_piece import GetAssembledPiecesResponse,GetAssembledPieceResponse

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

router = APIRouter(prefix="/assembled_pieces")
assembled_piece_service = AssembledPieceService()

@router.post(
    path="",
    status_code=201,
    responses={
        status.HTTP_201_CREATED: {"model": GetAssembledPieceResponse},
        status.HTTP_409_CONFLICT: {"model": ConflictError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
)
def create_assembled_piece(
    body: CreateAssembledPieceRequest, 
) -> GetAssembledPieceResponse:
    """Create a new assembled_piece"""
    try:
        return assembled_piece_service.create_assembled_piece(
            body=body,
        )
    except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException, BadRequestException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get(
    path="",
    status_code=200,
    responses={
        status.HTTP_200_OK: {"model": GetAssembledPiecesResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": SomethingWrongError},
        status.HTTP_404_NOT_FOUND: {'model': ResourceNotFoundError}
    },
)
async def list_assembled_pieces(
    filters: ListAssembledPiecesFilters= Depends(),
) -> GetAssembledPiecesResponse:
    """List assembled_pieces"""
    try:
        return await assembled_piece_service.list_assembled_pieces(
            filters=filters,
        )
    except (BaseException, ForbiddenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

