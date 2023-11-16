from typing import List
import json
from schemas.requests.piece import ListPiecesFilters
from schemas.exceptions.base import ResourceNotFoundException
from clients.github_rest_client import GithubRestClient

from core.logger import get_configured_logger
from core.settings import settings
from repository.user_repository import UserRepository
from repository.workspace_repository import WorkspaceRepository
from repository.piece_repository_repository import PieceRepositoryRepository
from database.models import Piece, PieceRepository
from database.models.enums import RepositorySource
from clients.local_files_client import LocalFilesClient
from repository.piece_repository import PieceRepository
from schemas.responses.piece import GetPiecesResponse
from utils.base_node_style import get_frontend_node_style
from constants.default_pieces.storage import DEFAULT_STORAGE_PIECES


class PieceService(object):
    def __init__(self) -> None:
        self.logger = get_configured_logger(self.__class__.__name__)
        self.piece_repository = PieceRepository()
        self.piece_repository_repository = PieceRepositoryRepository()
        self.workspace_repository = WorkspaceRepository()
        self.user_repository = UserRepository()
        self.file_system_client = LocalFilesClient()

    def list_pieces(
        self,
        piece_repository_id: int,
        page: int,
        page_size: int,
        filters: ListPiecesFilters
    ) -> List[GetPiecesResponse]:
        """List all pieces for all repositories of a workspace

        Args:
            workspace_id (int): Workspace id
            piece_repository_id (int): Piece repository id
            page (int): Page number
            page_size (int): page_size per page - max 50
            auth_context (AuthorizationContextData): User authorization context data

        Returns:
            List[GetPiecesResponse]: List of all pieces data
        """
        
        piece_repository = self.piece_repository_repository.find_by_id(id=piece_repository_id)
        if not piece_repository:
            raise ResourceNotFoundException(message="Workspace or Piece Repository not found")

        pieces = self.piece_repository.find_by_repository_id(
            repository_id=piece_repository_id,
            page=page,
            page_size=page_size,
            filters=filters.dict(exclude_none=True),
        )
        return [
            GetPiecesResponse(**piece.to_dict()) for piece in pieces
        ]


    def check_pieces_to_update_github(
        self, 
        repository_id: int, 
        compiled_metadata: dict,
        dependencies_map: dict,
    ) -> None:
        github_pieces_names_list = list(compiled_metadata.keys())
        updated_pieces_list = list()
        for piece_name in github_pieces_names_list:
            # Create piece if it does not exist, update if it exists (ignoring version control)
            piece_metadata = compiled_metadata[piece_name]
            self._update_pieces_from_metadata(
                piece_metadata=piece_metadata,
                dependencies_map=dependencies_map,
                repository_id=repository_id
            )
        response_msg = ", ".join(updated_pieces_list) if len(updated_pieces_list) > 0 else "None"
        return response_msg

    def _get_piece_image_by_name(self, dependencies_map: dict, piece_name: str) -> str:
        """Get the group name for the piece dependency

        Args:
            dependencies_map_dict (dict): Dependencies map dictionary
            piece_name (str): Piece name
        """
        self.logger.info(f"Getting dependency group name for piece: {piece_name}")
        for group_dependencies in dependencies_map.values():
            if piece_name in group_dependencies.get('pieces'):
                return group_dependencies.get('source_image')
        return None

    def _update_pieces_from_metadata(self, piece_metadata: dict, dependencies_map: dict, repository_id: int) -> None:
        """Update an piece in database from its metadata

        Args:
            piece_metadata (dict): Piece metadata dictionary
            group_id (int): User groupt that the piece belongs to
        """
        source_image = self._get_piece_image_by_name(dependencies_map=dependencies_map, piece_name=piece_metadata.get('name'))
        piece_metadata["input_schema"]["title"] = piece_metadata.get("name")
        piece_style = piece_metadata.get("style")
        name = piece_metadata.get("name")
        style = get_frontend_node_style(module_name=name, **piece_style)
        new_piece = Piece(
            name=piece_metadata.get("name"),
            dependency=piece_metadata.get("dependency"),
            description=piece_metadata.get("description"),
            source_image=source_image,
            source_url=piece_metadata.get("source_url"),
            input_schema=piece_metadata.get("input_schema", {}),
            output_schema=piece_metadata.get("output_schema", {}),
            secrets_schema=piece_metadata.get("secrets_schema", {}),
            style=style,
            repository_id=repository_id
        )
        db_piece = self.piece_repository.find_by_name_and_repository_id(
            name=name,
            repository_id=repository_id
        )
        if not db_piece:
            self.piece_repository.create(new_piece)
            return
        self.piece_repository.update(new_piece, piece_id=db_piece.id)


    def create_default_storage_pieces(self, piece_repository_id: int = 1) -> None:
        """Create default storage pieces in database
        """
        self.logger.info("Creating default storage pieces")

        pieces = []
        for piece_metadata in DEFAULT_STORAGE_PIECES:
            model = piece_metadata.get('model')()
            piece = Piece(
                name=model.name,
                description=model.description,
                secrets_schema=model.secrets_schema,
                input_schema=model.input_schema,
                repository_id=piece_repository_id
            )
            pieces.append(piece)
        pieces = self.piece_repository.create_many(pieces)
        return pieces



if __name__ == '__main__':
    PieceService().create_default_storage_pieces()



