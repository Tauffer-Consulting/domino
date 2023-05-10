from fastapi import APIRouter, HTTPException, status

from services.model_service import ModelService
from schemas.exceptions.base import BaseException, UnauthorizedException
from schemas.errors.base import SomethingWrongError, UnauthorizedError


router = APIRouter(prefix="/model")

model_service = ModelService()



@router.get(
    '/info',
    status_code=200
)
def get_all_models_info():
    """
    Get info form all Models
    """
    try:
        return model_service.get_models_info(model_id=None)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=SomethingWrongError(e))


@router.get(
    '/info/{model_id}',
    status_code=200
)
def get_model_info(model_id: str):
    """
    Get info from a specific Model
    """
    try:
        return model_service.get_models_info(model_id=model_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=SomethingWrongError(e))