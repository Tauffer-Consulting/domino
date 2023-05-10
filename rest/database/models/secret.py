from database.models.base import Base, BaseDatabaseModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Integer, ForeignKey

class Secret(Base, BaseDatabaseModel):
    __tablename__ = "secret"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=True)
    piece_repository_id = Column(Integer, ForeignKey("piece_repository.id",  ondelete='cascade'), nullable=False)

    piece_repository = relationship("PieceRepository", back_populates="secrets")

