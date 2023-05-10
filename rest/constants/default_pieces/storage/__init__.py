from .aws_s3 import SecretsModel as AWSS3SecretsModel, AWSS3DefaultPiece
from .google_storage import SecretsModel as GoogleStorageSecretsModel, GCPStorageDefaultPiece


DEFAULT_STORAGE_PIECES = [
    {
        "model": AWSS3DefaultPiece,
        "secrets_model": AWSS3SecretsModel
    },
    {
        "model": GCPStorageDefaultPiece,
        "secrets_model": GoogleStorageSecretsModel
    }
    
]
