from database.models.base import Base, BaseDatabaseModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Integer, JSON, ForeignKey, text

class AssembledPiece(Base, BaseDatabaseModel):
    __tablename__ = "assembled_piece"

    id = Column(Integer, primary_key=True)
    workflow_id = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    dependency = Column(JSON, nullable=True)
    input_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    output_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb")) # Using server default empty JSON object to avoid null value in database
    secrets_schema = Column(JSON, nullable=False, server_default=text("'{}'::jsonb"))
    style = Column(JSON, nullable=True)
    
    
