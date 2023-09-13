from .aws_s3 import AWSS3StoragePiece
#from .google_storage import SecretsModel as GoogleStorageSecretsModel, GCPStorageDefaultPiece


DEFAULT_STORAGE_PIECES = [
    {
        "model": AWSS3StoragePiece,
        # "secrets_model": AWSS3SecretsModel,
        # "input_model": InputModel
    },
    # {
    #     "model": GCPStorageDefaultPiece,
    #     "secrets_model": GoogleStorageSecretsModel
    # }
    
]
