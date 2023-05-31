from fastapi import APIRouter, HTTPException, status

from services.dataset_service import DatasetService
from schemas.exceptions.base import BaseException, UnauthorizedException
from schemas.errors.base import SomethingWrongError, UnauthorizedError


router = APIRouter(prefix="/dataset")

dataset_service = DatasetService()



@router.get(
    '/info',
    status_code=200
)
def get_all_datasets_info():
    """
    Get info form all Datasets
    """
    try:
        return dataset_service.get_datasets_info(dataset_id=None)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=SomethingWrongError(e))


@router.get(
    '/info/{dataset_id}',
    status_code=200
)
def get_dataset_info(dataset_id: str):
    """
    Get info from a specific Dataset
    """
    try:
        return dataset_service.get_datasets_info(dataset_id=dataset_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=SomethingWrongError(e))