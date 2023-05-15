from database.models.base import Base
from sqlalchemy import Column, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
from database.models.enums import Permission, UserWorkspaceStatus

class UserWorkspaceAssociative(Base):
    __tablename__ = "user_workspace_associative"

    id = Column(Integer, primary_key=True)
    user_id = Column("user_id", ForeignKey("user.id", ondelete='cascade'), primary_key=False)
    workspace_id = Column("workspace_id", ForeignKey("workspace.id", ondelete='cascade'), primary_key=False)
    permission = Column(Enum(Permission), nullable=False, default=Permission.owner.value, server_default=Permission.owner.value)
    status = Column(Enum(UserWorkspaceStatus), nullable=False, default=UserWorkspaceStatus.pending.value, server_default=UserWorkspaceStatus.pending.value)

    user = relationship("User", back_populates="workspaces", lazy="subquery")
    workspace = relationship("Workspace", back_populates="users", lazy="subquery")