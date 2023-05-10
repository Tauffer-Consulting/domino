from database.models.base import Base
from sqlalchemy import Column, ForeignKey, Enum


class WorkflowPieceRepositoryAssociative(Base):
    __tablename__ = "workflow_piece_repository_associative"
    workflow_id = Column("workflow_id", ForeignKey("workflow.id", ondelete='cascade'), primary_key=True)
    piece_repository_id = Column("piece_repository_id", ForeignKey("piece_repository.id", ondelete='cascade'), primary_key=True)