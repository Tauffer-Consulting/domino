from database.models.base import Base, BaseDatabaseModel
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


class User(Base, BaseDatabaseModel):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    email = Column(String(50), unique=True)
    password = Column(String(200), nullable=False)

    workspaces = relationship(
        "UserWorkspaceAssociative",
        back_populates="user",
        lazy="subquery", 
        uselist=True
    )