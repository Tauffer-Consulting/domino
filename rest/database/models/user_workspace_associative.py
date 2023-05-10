from database.models.base import Base
from sqlalchemy import Column, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.models.enums import Permission

class UserWorkspaceAssociative(Base):
    __tablename__ = "user_workspace_associative"
    user_id = Column("user_id", ForeignKey("user.id", ondelete='cascade'), primary_key=True)
    workspace_id = Column("workspace_id", ForeignKey("workspace.id", ondelete='cascade'), primary_key=True)
    permission = Column(Enum(Permission), nullable=False, default=Permission.owner.value, server_default=Permission.owner.value)

    user = relationship("User", back_populates="workspaces", lazy="subquery")
    workspace = relationship("Workspace", back_populates="users", lazy="subquery")