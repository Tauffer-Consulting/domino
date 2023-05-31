from pydantic import BaseModel, Field

class AWSS3DefaultPiece(BaseModel):
    name: str = Field(title='Name', default='AWSS3DefaultPiece')
    description: str = Field(title='Description', default='AWS s3 Storage Default Piece')


class SecretsModel(BaseModel):
    AWS_ACCESS_KEY_ID: str = Field(title='AWS Access Key ID', default='')
    AWS_SECRET_ACCESS_KEY: str = Field(title='AWS Secret Access Key', default='')
    AWS_REGION_NAME: str = Field(title='AWS Region Name', default='')

