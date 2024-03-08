from database.models.base import Base, BaseDatabaseModel
from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON, ForeignKey
from database.models.enums import RepositorySource
from sqlalchemy.orm import relationship
from datetime import datetime


class PieceRepository(Base, BaseDatabaseModel):
    __tablename__ = "piece_repository"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    name = Column(String(50), unique=False)
    label = Column(String(50), unique=False)
    source = Column(Enum(RepositorySource), nullable=True, default=RepositorySource.github.value)
    path = Column(String(250), nullable=True)
    url = Column(String(250), nullable=True)
    version = Column(String(15), nullable=True)
    dependencies_map = Column(JSON, nullable=True)
    compiled_metadata = Column(JSON, nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspace.id", ondelete='cascade'), nullable=False)

    workspace = relationship(
        "Workspace",
        back_populates="piece_repositories",
        lazy='subquery',
        uselist=True,
        cascade="all, delete"
    )

    pieces = relationship(
        "Piece",
        back_populates="piece_repository",
        lazy="subquery",
        uselist=True,
        cascade="all, delete"
    )

    secrets = relationship(
        "Secret",
        back_populates="piece_repository",
        lazy="subquery",
        uselist=True,
        cascade="all, delete"
    )
