import uvicorn
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth_router import router as auth_router
from routers.user_router import router as user_router
from routers.workflow_router import router as workflow_router
from routers.piece_router import router as piece_router
from routers.assembled_piece_router import router as assembled_piece_router
from routers.workspace_router import router as workspace_router
from routers.piece_repository_router import router as piece_repository_router
from routers.secret_router import router as secret_router
from routers.health_check_router import router as health_check_router
from core.settings import settings


description = """
Documentation for Domino API
"""


def configure_app():
    load_dotenv(find_dotenv())
    app = FastAPI(
        root_path=settings.ROOT_PATH,
        title=settings.APP_TITLE,
        description=description,
        version=settings.VERSION,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS["origins"],
        allow_credentials=settings.CORS["allow_credentials"],
        allow_methods=settings.CORS["allow_methods"],
        allow_headers=settings.CORS["allow_headers"],
    )

    # Include routers
    app.include_router(auth_router, tags=["Auth"])
    app.include_router(user_router, tags=["User"])
    app.include_router(piece_repository_router, tags=['Piece Repository'])
    app.include_router(piece_router, tags=["Piece"])
    app.include_router(assembled_piece_router, tags=["Assembled Piece"])
    app.include_router(workflow_router, tags=["Workflow"])
    app.include_router(workspace_router, tags=["Workspace"])
    app.include_router(secret_router, tags=["Secret"])
    app.include_router(health_check_router, tags=["Health Check"])

    return app, settings


app, settings = configure_app()



if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )