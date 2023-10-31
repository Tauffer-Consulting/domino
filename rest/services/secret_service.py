from typing import List
from repository.secret_repository import SecretRepository
from core.logger import get_configured_logger
from schemas.requests.secret import PatchSecretValueRequest
from schemas.responses.secret import ListRepositorySecretsResponse, GetSecretsByPieceResponse
from schemas.exceptions.base import ResourceNotFoundException
from repository.piece_repository import PieceRepository
from services.auth_service import AuthService
from database.models import Secret, Piece
from typing import List
from cryptography.fernet import Fernet
from core.settings import settings


class SecretService(object):

    def __init__(self) -> None:

        self.secret_repository = SecretRepository()
        self.piece_repository = PieceRepository()
        self.logger = get_configured_logger(self.__class__.__name__)
        self.auth_service = AuthService()
        self.secret_fernet = Fernet(settings.SECRETS_SECRET_KEY)

    def create_default_storage_pieces_secrets(
        self,
        pieces: List[Piece],
        workspace_id: int,
        repository_id: int
    ):
        secrets_to_update = list()
        for piece in pieces:
            piece_secrets_schema = piece.secrets_schema
            secrets_to_update.extend(piece_secrets_schema.get('properties').keys())
        secrets_to_update = list(set(secrets_to_update))

        for secret in secrets_to_update:
            self.create_workspace_repository_secret(
                workspace_id=workspace_id,
                repository_id=repository_id,
                secret_name=secret,
            )

    def create_workspace_repository_secret(
        self, 
        workspace_id: int,
        repository_id: int,
        secret_name: str,
    ):
        """Create workspace secret"""
        self.logger.info(f"Creating secret for workspace {workspace_id} and repository {repository_id}")
        new_secret = Secret(
            name=secret_name,
            value=None,
            piece_repository_id=repository_id 
        )
        secret = self.secret_repository.create(secret=new_secret)
        return secret

    def update_repository_secret(
        self,
        piece_repository_id: int,
        secret_id: int,
        body: PatchSecretValueRequest,
    ):
        self.logger.info(f"Updating secret {secret_id} for repository {piece_repository_id}")
        secret = self.secret_repository.find_by_id(id=secret_id)
        if not secret:
            raise ResourceNotFoundException()
        
        if not body.value:
            secret.value = None
        else:
            secret_value = body.value.get_secret_value()
            encrypted_secret = self.secret_fernet.encrypt(
                data=secret_value.encode('utf-8')
            )
            decoded_encrypted_secret = encrypted_secret.decode('utf-8')
            secret.value = decoded_encrypted_secret
        self.secret_repository.update(
            secret=secret,
            secret_id=secret.id
        )

    def get_repository_secrets(self, piece_repository_id: int) -> List[ListRepositorySecretsResponse]:
        self.logger.info(f"Getting secrets for repository {piece_repository_id}")
        # TODO add pagination if needed?
        secrets = self.secret_repository.find_by_piece_repository_id(piece_repository_id=piece_repository_id)
        response = [
            ListRepositorySecretsResponse(
                **secret.to_dict(),
                is_filled=True if secret.value else False
            ) for secret in secrets
        ]
        return response

    def get_piece_secrets(
        self, 
        piece_repository_id: int,
        piece_name: str
    ) -> List[GetSecretsByPieceResponse]:
        """
        Get secrets from a repository in a specific workspace.

        Args:
            workspace_id (int): _description_
            repository_id (int): _description_
            piece_name (str): _description_
        """
        # Get the required Secrets names for the Piece
        piece_item = self.piece_repository.find_by_name_and_repository_id(name=piece_name, repository_id=piece_repository_id)
        if not piece_item:
            raise ResourceNotFoundException()

        secrets_names = self.piece_repository.get_piece_secrets_names_by_repository_id(name=piece_name, repository_id=piece_repository_id)
        secrets_names = [e[0] for e in secrets_names]

        if not secrets_names:
            secrets_names = []
        self.logger.info(f"Fetching the folowing secrets for {piece_name} from repository {piece_repository_id}: " + ", ".join(secrets_names))
        response = list()
        for secret in secrets_names:
            secret_item = self.secret_repository.find_by_name_and_piece_repository_id(name=secret, piece_repository_id=piece_repository_id)
            if not secret_item:
                raise ResourceNotFoundException()
            str_value = secret_item.value
            decoded_value = None if not str_value else self.secret_fernet.decrypt(str_value.encode('utf-8')).decode('utf-8')
            response.append(
                GetSecretsByPieceResponse(
                    name=secret,
                    value=decoded_value
                )
            )

        return response