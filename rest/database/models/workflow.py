from database.models.base import Base
from database.models.enums import WorkflowScheduleInterval
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

class Workflow(Base):
    __tablename__ = "workflow"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=False, nullable=False)
    uuid_name = Column(String(50), unique=True, nullable=False, default=lambda: str(uuid4()).replace('-',''))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    schema = Column(JSON, nullable=True)
    ui_schema = Column(JSON, nullable=True)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    last_changed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    schedule = Column(Enum(WorkflowScheduleInterval), nullable=True, default=WorkflowScheduleInterval.none.value)
    workspace_id = Column(Integer, ForeignKey("workspace.id", ondelete='cascade'), nullable=False)
    last_changed_by = Column(Integer, ForeignKey("user.id"), nullable=False)

    workspace = relationship("Workspace", back_populates="workflows")

