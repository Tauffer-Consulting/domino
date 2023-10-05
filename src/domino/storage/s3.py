import boto3
from botocore.exceptions import NoCredentialsError, UnknownCredentialError, NoAuthTokenError , ClientError
from domino.logger import get_configured_logger

class S3StorageRepository:
    # Class to handle S3 Domino Storage support
    logger = get_configured_logger('S3StorageRepository')

    @classmethod
    def validate_s3_credentials_access(cls, access_key: str, secret_key: str, bucket: str) -> bool:
        cls.logger.info(f"Validating S3 Credentials for bucket {bucket}")
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=access_key, 
                aws_secret_access_key=secret_key,
            )
            s3.list_objects(Bucket=bucket, MaxKeys=1)
            cls.logger.info(f"S3 Credentials are valid")
            return True
        except (NoCredentialsError, UnknownCredentialError, NoAuthTokenError, ClientError):
            cls.logger.info("Invalid credentials")
            return False
        except Exception as e:
            cls.logger.info(f"Error Validating credentials: {e}")
            return False
        return False
