from datetime import datetime
from httpx import Response
import json
import pytest
from schemas.responses.piece_repository import CreateRepositoryReponse, GetRepositoryReleasesResponse, GetWorkspaceRepositoriesResponse, GetRepositoryReleaseDataResponse, PatchRepositoryResponse, GetRepositoryResponse, GetWorkspaceRepositoriesData, PaginationSet
from database.models.piece_repository import PieceRepository

pytest_plugins = [
    "tests.piece_repository.fixtures",
]

@pytest.mark.usefixtures("register", "login")
class TestPieceRepositoryRouter:
    @staticmethod
    def test_get_repository_releases(get_repository_releases: Response):
        mock_response = [
            GetRepositoryReleasesResponse(
                version = "0.0.7", 
                last_modified = f"{datetime.utcnow()}"
            )
        ]
        response = get_repository_releases
        content = response.json()
        mock_response_content = json.loads(mock_response[0].model_dump_json())

        assert response.status_code == 200
        assert content[0].keys() == mock_response_content.keys()

    @staticmethod
    def test_add_piece_repository(add_piece_repository: Response, piece_repository: PieceRepository):
        mock_response = CreateRepositoryReponse(
            id=piece_repository.id, 
            name=piece_repository.name,
            created_at=piece_repository.created_at,
            source=piece_repository.source,
            label=piece_repository.label,
            path=piece_repository.path,
            version=piece_repository.version,
            workspace_id=piece_repository.workspace_id
        )
        response = add_piece_repository
        content = response.json()
        if content.get("id") != None:
            mock_response_content = json.loads(mock_response.model_dump_json())

            assert response.status_code == 200       
            assert content.keys() == mock_response_content.keys()
            for key in content.keys():
                assert content.get(key) == mock_response_content.get(key)
    
    @staticmethod
    def test_get_pieces_repositories(add_piece_repository: Response, get_pieces_repositories: Response, piece_repository: PieceRepository):
        mock_response = GetWorkspaceRepositoriesResponse(
            data = [
                GetWorkspaceRepositoriesData(
                    id=piece_repository.id,
                    created_at=piece_repository.created_at,
                    name=piece_repository.name,
                    label=piece_repository.label,
                    source=piece_repository.source,
                    path=piece_repository.path,
                    version=piece_repository.version,
                    workspace_id=piece_repository.workspace_id
                )
            ],
            metadata = PaginationSet(
                page=0,
                records=1,
                total=1,
                last_page=0
            )
        )
        response = get_pieces_repositories
        content = response.json()
        mock_response_content = json.loads(mock_response.model_dump_json())

        assert response.status_code == 200
        assert content.keys() == mock_response_content.keys()
        for key in content["data"][0].keys():
            assert content["data"][0].get(key) == mock_response_content["data"][0].get(key)
        for key in content["metadata"].keys():
            assert content["metadata"].get(key) == mock_response_content["metadata"].get(key)
            
    @staticmethod
    def test_get_piece_repository_release_data(add_piece_repository: Response, get_piece_repository_release_data: Response, piece_repository: PieceRepository):
        mock_response = GetRepositoryReleaseDataResponse(
            name = piece_repository.name,
            description = None,
            pieces = [
                'SimpleLogPiece'
            ]
        )
        response = get_piece_repository_release_data
        content = response.json()
        mock_response_content = json.loads(mock_response.model_dump_json())

        assert response.status_code == 200
        assert content.keys() == mock_response_content.keys()
        for key in content.keys():
            assert content.get(key) == mock_response_content.get(key)
    
    @staticmethod
    def test_get_piece_repository_by_id(add_piece_repository: Response, piece_repository: PieceRepository, get_piece_repository_by_id: Response):
        mock_response = GetRepositoryResponse(
            id = piece_repository.id,
            created_at = piece_repository.created_at,
            name = piece_repository.name,
            source = piece_repository.source,
            path = piece_repository.path,
            version = piece_repository.version,
            workspace_id = piece_repository.workspace_id
        )
        response = get_piece_repository_by_id
        content = response.json()
        mock_response_content = json.loads(mock_response.model_dump_json())

        assert response.status_code == 200
        assert content.keys() == mock_response_content.keys()
        for key in content.keys():
            assert content.get(key) == mock_response_content.get(key)
    
    @staticmethod
    @pytest.mark.skip(reason="Not implemented yet")
    def test_patch_piece_repository(add_piece_repository: Response, patch_piece_repository: Response, piece_repository: PieceRepository):
        mock_response = PatchRepositoryResponse(
            id = piece_repository.id,
            name = piece_repository.name,
            created_at = piece_repository.created_at,
            source = piece_repository.source,
            path = piece_repository.path,
            version = piece_repository.version,
            workspace_id = piece_repository.workspace_id
        )
        response = patch_piece_repository
        content = response.json()
        mock_response_content = json.loads(mock_response.model_dump_json())

        assert response.status_code == 200
        assert content.keys() == mock_response_content.keys()
        for key in content.keys():
            assert content.get(key) == mock_response_content.get(key)
    
    @staticmethod
    def test_delete_piece_repository(add_piece_repository: Response, delete_piece_repository: Response, get_piece_repository_by_id: Response):
        response = delete_piece_repository
        assert response.status_code == 204
        response = get_piece_repository_by_id
        assert response.status_code == 404
