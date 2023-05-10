from pydantic import BaseModel, Field

class GCPStorageDefaultPiece(BaseModel):
    name: str = Field(title='Name', default='GCPStorageDefaultPiece')
    description: str = Field(title='Description', default='GCP Storage Default Piece')


class SecretsModel(BaseModel):
    SOME_ACCESS_KEY: str = Field(title='Some Access Key', default='')
    ANOTHER_KEY: str = Field(title='Another Key', default='')

