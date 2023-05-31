from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/health-check")


@router.get(
    path="",
    status_code=200
)
def health_check():
    try:
        response = {"status": "ok"}
        return response
    except (BaseException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)