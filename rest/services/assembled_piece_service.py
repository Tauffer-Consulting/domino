import asyncio
from clients.airflow_client import AirflowRestClient
from clients.local_files_client import LocalFilesClient
from clients.github_rest_client import GithubRestClient
from database.models.assembled_piece import AssembledPiece
from repository.assembled_piece_repository import AssembledPieceRepository
from core.logger import get_configured_logger
from schemas.requests.assembled_piece import CreateAssembledPieceRequest, ListAssembledPiecesFilters
from schemas.responses.assembled_piece import GetAssembledPiecesResponse,GetAssembledPieceResponse
from core.settings import settings
from uuid import uuid4
from schemas.exceptions.base import (
    BaseException,
    ConflictException,
    ForbiddenException,
    ResourceNotFoundException,
    UnauthorizedException,
    BadRequestException
)


class AssembledPieceService(object):
    def __init__(self)->None:
        # Clients
        self.file_system_client = LocalFilesClient()
        self.github_rest_client = GithubRestClient(token=settings.DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS)
        self.airflow_client = AirflowRestClient()

        # Repositories
        self.assembled_piece_repository = AssembledPieceRepository()

        # Configs
        self.logger = get_configured_logger(self.__class__.__name__)

    def create_assembled_piece(
        self,
        body: CreateAssembledPieceRequest, 
    ) -> GetAssembledPieceResponse:
        """Create a new assembled_piece"""
        self.logger.info(f"Creating assembled piece {body.name}")
        assembled_piece = self.assembled_piece_repository.find_by_name(
            name=body.name
        )
        if assembled_piece is not None:
            raise ConflictException(f"Assembled piece {body.name} already exists")
        try:
            workflow_ID = str(uuid4()).replace('-', '')
            assembled_piece = AssembledPiece(
                name=body.name,
                workflow_id=workflow_ID,
                description=body.description,
                dependency=body.dependency,
                input_schema=body.input_schema,
                output_schema=body.output_schema,
                secrets_schema=body.secrets_schema,
                style=body.style,
            )
            assembled_piece = self.assembled_piece_repository.create(assembled_piece)

            response = GetAssembledPieceResponse(
                id=assembled_piece.id,
                name=assembled_piece.name,
                workflow_id=assembled_piece.workflow_id,
                description=assembled_piece.description,
                dependency=assembled_piece.dependency,
                input_schema=assembled_piece.input_schema,
                output_schema=assembled_piece.output_schema,
                secrets_schema=assembled_piece.secrets_schema,
                style=assembled_piece.style,
            )
            self.logger.info(f"Created assembled piece {body.name}")
            return response
        except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException) as custom_exception:
                asyncio.run(self.assembled_piece_repository.delete_by_id(assembled_piece.id))
                raise custom_exception
        
    async def list_assembled_pieces(
        self,
        filters: ListAssembledPiecesFilters,
    ) -> GetAssembledPiecesResponse:
        """List assembled_pieces"""
        self.logger.info(f"Listing assembled pieces")
        try:
            assembled_pieces = self.assembled_piece_repository.find_all()
            response = GetAssembledPiecesResponse(
                assembled_pieces=[
                    GetAssembledPieceResponse(
                        id=assembled_piece.id,
                        name=assembled_piece.name,
                        workflow_id=assembled_piece.workflow_id,
                        description=assembled_piece.description,
                        dependency=assembled_piece.dependency,
                        input_schema=assembled_piece.input_schema,
                        output_schema=assembled_piece.output_schema,
                        secrets_schema=assembled_piece.secrets_schema,
                        style=assembled_piece.style,
                    ) for assembled_piece in assembled_pieces
                ]
            )
            self.logger.info(f"Listed assembled pieces")
            return response
        except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException) as custom_exception:
            raise custom_exception