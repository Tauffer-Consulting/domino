from database.models.base import Base, BaseDatabaseModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Integer, JSON, ForeignKey, text

class Piece(Base, BaseDatabaseModel):
    __tablename__ = "piece"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    dependency = Column(JSON, nullable=True)
    source_image = Column(String, nullable=True)
    input_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    output_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb")) # Using server default empty JSON object to avoid null value in database
    secrets_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    style = Column(JSON, nullable=True)
    source_url = Column(String, nullable=True)
    repository_id = Column(Integer, ForeignKey('piece_repository.id', ondelete='cascade'), nullable=False)
    piece_repository = relationship('PieceRepository', back_populates='pieces', lazy="subquery")
