from database.models.base import Base, BaseDatabaseModel
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship


class Workspace(Base, BaseDatabaseModel):
    __tablename__ = "workspace"

    # Table columns
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    github_access_token = Column(String, nullable=True)
    

    users = relationship(
        "UserWorkspaceAssociative", 
        back_populates="workspace", 
        lazy='subquery', 
        uselist=True,
        cascade="all, delete"
    )
    workflows = relationship(
        "Workflow",
        back_populates="workspace",
        lazy='subquery',
        uselist=True,
        cascade="all, delete"
    )
    piece_repositories = relationship(
        "PieceRepository", 
        back_populates="workspace", 
        lazy='subquery', 
        uselist=True,
        cascade="all, delete"
    )
