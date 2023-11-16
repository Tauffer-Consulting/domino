from typing import List
import json
import tomli
from math import ceil
from datetime import datetime
from core.logger import get_configured_logger
from schemas.context.auth_context import AuthorizationContextData
from schemas.requests.piece_repository import CreateRepositoryRequest, PatchRepositoryRequest, ListRepositoryFilters
from schemas.responses.piece_repository import (
    CreateRepositoryReponse,
    GetRepositoryReleasesResponse,
    PatchRepositoryResponse,
    GetWorkspaceRepositoriesData,
    GetWorkspaceRepositoriesResponse,
    GetRepositoryReleaseDataResponse,
    GetRepositoryResponse
)
from schemas.responses.base import PaginationSet
from schemas.exceptions.base import ConflictException, ResourceNotFoundException, ForbiddenException, UnauthorizedException
from services.piece_service import PieceService
from services.secret_service import SecretService
from repository.workspace_repository import WorkspaceRepository
from repository.piece_repository_repository import PieceRepositoryRepository
from repository.workflow_repository import WorkflowRepository
from repository.secret_repository import SecretRepository
from database.models.enums import RepositorySource
from database.models import PieceRepository
from clients.github_rest_client import GithubRestClient
from core.settings import settings


class PieceRepositoryService(object):
    def __init__(self) -> None:
        self.logger = get_configured_logger(self.__class__.__name__)
        self.piece_service = PieceService()
        self.secret_service = SecretService()
        self.workspace_repository = WorkspaceRepository()
        self.piece_repository_repository = PieceRepositoryRepository()
        self.workflow_repository = WorkflowRepository()
        self.secret_repository = SecretRepository()

        # TODO change token from app level to workspace level

    def get_piece_repository(self, piece_repository_id: int) -> GetRepositoryResponse:
        piece_repository = self.piece_repository_repository.find_by_id(piece_repository_id)
        if not piece_repository:
            raise ResourceNotFoundException()

        if not piece_repository.label:
            piece_repository.label = piece_repository.name

        response = GetRepositoryResponse(
            **piece_repository.to_dict(),
        )
        return response

    def get_pieces_repositories(
        self,
        workspace_id: int,
        page: int,
        page_size: int,
        filters: ListRepositoryFilters
    ) -> GetWorkspaceRepositoriesResponse:
        self.logger.info(f"Getting repositories for workspace {workspace_id}")
        pieces_repositories = self.piece_repository_repository.find_by_workspace_id(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size,
            filters=filters.dict(exclude_none=True)
        )
        data = []
        for piece_repository in pieces_repositories:
            if not piece_repository[0].label:
                piece_repository[0].label = piece_repository[0].name
            data.append(GetWorkspaceRepositoriesData(**piece_repository[0].to_dict()))

        count = 0 if not pieces_repositories else pieces_repositories[0].count
        metadata = PaginationSet(
            page=page,
            records=len(data),
            total=count,
            last_page=max(0, ceil(count / page_size) - 1)
        )
        response = GetWorkspaceRepositoriesResponse(data=data, metadata=metadata)
        return response

    def get_piece_repository_releases(self, source: str, path: str, auth_context: AuthorizationContextData) -> List[GetRepositoryReleasesResponse]:
        self.logger.info(f"Getting releases for repository {path}")

        token = auth_context.workspace.github_access_token if auth_context.workspace.github_access_token else settings.DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN
        if not token.strip():
            token = None
        github_client = GithubRestClient(token=token)
        if source == getattr(RepositorySource, 'github').value:
            tags = github_client.get_tags(repo_name=path)
        # TODO add other sources
        if not tags:
            return []
        return [GetRepositoryReleasesResponse(version=tag.name, last_modified=tag.last_modified) for tag in tags]

    def get_piece_repository_release_data(self, version: str, source:str, path: str, auth_context: AuthorizationContextData) -> GetRepositoryReleaseDataResponse:
        self.logger.info(f'Getting release data for repository {path}')

        token = auth_context.workspace.github_access_token if auth_context.workspace.github_access_token else settings.DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN
        if not token.strip():
            token = None
        tag_data = self._read_repository_data(path=path, source=source, version=version, github_access_token=token)
        name = tag_data.get('config_toml').get('repository').get("REPOSITORY_NAME")
        description = tag_data.get('config_toml').get('repository').get("DESCRIPTION")
        pieces_list = list(tag_data.get('compiled_metadata').keys())
        response = GetRepositoryReleaseDataResponse(
            name=name,
            description=description,
            pieces=pieces_list
        )
        return response

    def patch_piece_repository(
        self,
        repository_id: int,
        piece_repository_data: PatchRepositoryRequest
    ) -> PatchRepositoryResponse:

        repository = self.piece_repository_repository.find_by_id(id=repository_id)
        if not repository:
            raise ResourceNotFoundException()
        self.logger.info(f"Updating piece repository {repository.id} for workspace {repository.workspace_id}")

        repository_files_metadata = self._read_repository_data(
            source=repository.source,
            path=repository.path,
            version=piece_repository_data.version
        )
        new_repo = PieceRepository(
            created_at=datetime.utcnow(),
            name=repository_files_metadata['config_toml'].get('repository').get('REPOSITORY_NAME'),
            source=repository.source,
            path=repository.path,
            version=piece_repository_data.version,
            dependencies_map=repository_files_metadata['dependencies_map'],
            compiled_metadata=repository_files_metadata['compiled_metadata'],
            workspace_id=repository.workspace_id
        )
        repository = self.piece_repository_repository.update(piece_repository=new_repo, id=repository.id)
        self._update_repository_pieces(
            source=repository.source,
            path=repository.path,
            repository_id=repository.id,
            version=piece_repository_data.version
        )

        # Check secrets to update
        all_current_secrets = set()
        for value in repository_files_metadata['dependencies_map'].values():
            for secret in value.get('secrets'):
                all_current_secrets.add(secret)

        for secret in all_current_secrets:
            db_secret = self.secret_repository.find_by_name_and_piece_repository_id(
                name=secret,
                piece_repository_id=repository.id
            )
            # If secret exists, don't touch it
            if db_secret:
                continue
            self.secret_service.create_workspace_repository_secret(
                workspace_id=repository.workspace_id,
                repository_id=repository.id,
                secret_name=secret,
            )
        # Delete secrets that are not in the version dependencies map
        self.secret_repository.delete_by_piece_repository_id_and_not_names(
            names=all_current_secrets,
            piece_repository_id=repository.id
        )

        return PatchRepositoryResponse(**repository.to_dict())

    def create_default_storage_repository(self, workspace_id: int):
        """
        Create default storage repository for workspace.
        Creating a repository will create all pieces and secrets to this repository.
        """
        self.logger.info(f"Creating default storage repository")

        new_repo = PieceRepository(
            name=settings.DEFAULT_STORAGE_REPOSITORY['name'],
            created_at=datetime.utcnow(),
            workspace_id=workspace_id,
            path=settings.DEFAULT_STORAGE_REPOSITORY['path'],
            source=settings.DEFAULT_STORAGE_REPOSITORY['source'],
            version=settings.DEFAULT_STORAGE_REPOSITORY['version'],
            url=settings.DEFAULT_STORAGE_REPOSITORY['url']
        )

        default_storage_repository = self.piece_repository_repository.create(piece_repository=new_repo)
        pieces = self.piece_service.create_default_storage_pieces(
            piece_repository_id=default_storage_repository.id,
        )
        self.secret_service.create_default_storage_pieces_secrets(
            pieces=pieces,
            workspace_id=workspace_id,
            repository_id=default_storage_repository.id
        )
        return default_storage_repository

    def create_piece_repository(
        self,
        piece_repository_data: CreateRepositoryRequest,
        auth_context: AuthorizationContextData
    ) -> CreateRepositoryReponse:

        self.logger.info(f"Creating piece repository for workspace {piece_repository_data.workspace_id}")
        repository = self.piece_repository_repository.find_by_path_and_workspace_id(
            path=piece_repository_data.path,
            workspace_id=piece_repository_data.workspace_id
        )
        if repository:
            raise ConflictException(message=f"Repository {piece_repository_data.path} already exists for this workspace")

        token = auth_context.workspace.github_access_token if auth_context.workspace.github_access_token else settings.DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN
        if not token.strip():
            token = None
        repository_files_metadata = self._read_repository_data(
            source=piece_repository_data.source,
            path=piece_repository_data.path,
            version=piece_repository_data.version,
            github_access_token=token
        )
        new_repo = PieceRepository(
            created_at=datetime.utcnow(),
            name=repository_files_metadata['config_toml'].get('repository').get('REPOSITORY_NAME'),
            source=piece_repository_data.source,
            path=piece_repository_data.path,
            label=repository_files_metadata['config_toml'].get('repository').get('REPOSITORY_LABEL'),
            version=piece_repository_data.version,
            dependencies_map=repository_files_metadata['dependencies_map'],
            compiled_metadata=repository_files_metadata['compiled_metadata'],
            workspace_id=piece_repository_data.workspace_id,
            url=piece_repository_data.url
        )
        repository = self.piece_repository_repository.create(piece_repository=new_repo)
        try:
            # Create pieces for this repository in database
            self._update_repository_pieces(
                repository_id=repository.id,
                source=piece_repository_data.source,
                compiled_metadata=repository_files_metadata['compiled_metadata'],
                dependencies_map=repository_files_metadata['dependencies_map'],
            )
            # Create secrets for the repository with null values
            secrets_to_update = list()
            for value in repository_files_metadata['dependencies_map'].values():
                for secret in value.get('secrets'):
                    secrets_to_update.append(secret)
            secrets_to_update = list(set(secrets_to_update))

            for secret in secrets_to_update:
                self.secret_service.create_workspace_repository_secret(
                    workspace_id=piece_repository_data.workspace_id,
                    repository_id=repository.id,
                    secret_name=secret,
                )

            response = CreateRepositoryReponse(**repository.to_dict())
            return response
        except (BaseException, ForbiddenException, UnauthorizedException, ResourceNotFoundException) as e:
            self.logger.exception(e)
            self.piece_repository_repository.delete(id=repository.id)
            raise e

    def _read_data_from_github(self, path: str, version: str, github_access_token: str = None) -> dict:
        """Read files from a specific version of repository in github

        Args:
            path (str): Repository path
            version (str): Tag version name

        Raises:
            ResourceNotFoundException: If tag version is not found raise exception

        Returns:
            dict: dictionary containing repository data with the following keys:
                - dependencies_map: dependencies_map file data
                - compiled_metadata: compiled_metadata file data
                - config_toml: config_toml file data
        """
        github_client = GithubRestClient(token=github_access_token)
        tag = github_client.get_tag(repo_name=path, tag_name=version)
        if not tag:
            raise ResourceNotFoundException(message=f"Version {version} not found in repository {path}")

        commit_sha_ref = str(tag.commit.sha)
        dependencies_map = github_client.get_contents(
            repo_name=path,
            file_path='.domino/dependencies_map.json',
            commit_sha=commit_sha_ref
        )
        dependencies_map = json.loads(dependencies_map.decoded_content.decode('utf-8'))
        compiled_metadata = github_client.get_contents(
            repo_name=path,
            file_path='.domino/compiled_metadata.json',
            commit_sha=commit_sha_ref
        )
        compiled_metadata = json.loads(compiled_metadata.decoded_content.decode('utf-8'))

        config_toml = github_client.get_contents(
            repo_name=path,
            file_path='config.toml',
            commit_sha=commit_sha_ref
        )
        config_toml = tomli.loads(config_toml.decoded_content.decode('utf-8'))

        data = {
            "dependencies_map": dependencies_map,
            "compiled_metadata": compiled_metadata,
            "config_toml": config_toml
        }
        return data

    def _update_repository_pieces(
        self, 
        source: str,
        compiled_metadata: dict,
        dependencies_map: dict,
        repository_id: int,
    ):
        read_pieces_from_github = {
            "github": self.piece_service.check_pieces_to_update_github
        }
        read_pieces_from_github[source](
            repository_id=repository_id, 
            compiled_metadata=compiled_metadata,
            dependencies_map=dependencies_map,
        )

    def _read_repository_data(self, source: str, path: str, version: str, github_access_token: str):
        read_metadata_from_source_map = {
            "github": self._read_data_from_github,
        }
        return read_metadata_from_source_map[source](path=path, version=version, github_access_token=github_access_token)

    def delete_repository(self, piece_repository_id: int):
        repository = self.piece_repository_repository.find_by_id(id=piece_repository_id)
        if not repository:
            raise ResourceNotFoundException()

        if getattr(repository, 'source') == RepositorySource.default.value:
            raise ForbiddenException(message="Default repository can not be deleted.")

        results = self.workflow_repository.count_piece_repository_dependent_workflows(piece_repository_id=repository.id)
        if results > 0:
            raise ConflictException(message=f"Repository {repository.name} is used in {results} workflow{'' if results == 1 else 's'}, delete {'it' if results == 1 else 'them'} first.")

        self.piece_repository_repository.delete(id=piece_repository_id)