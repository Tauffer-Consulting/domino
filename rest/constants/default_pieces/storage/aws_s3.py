from pydantic import BaseModel, Field

class SecretsModel(BaseModel):
    AWS_ACCESS_KEY_ID: str = Field(title='AWS Access Key ID', default='')
    AWS_SECRET_ACCESS_KEY: str = Field(title='AWS Secret Access Key', default='')
    AWS_REGION_NAME: str = Field(title='AWS Region Name', default='')


class InputModel(BaseModel):
    bucket: str = Field(title='Bucket', default='')
    base_folder: str = Field(title='Base Folder', default='')



class AWSS3StoragePiece(BaseModel):
    name: str = Field(title='Name', default='AWSS3StoragePiece')
    description: str = Field(title='Description', default='AWS s3 Storage Default Piece')

    secrets_schema: dict = Field(default=SecretsModel.schema())
    input_schema: dict = Field(default=InputModel.schema())
    
