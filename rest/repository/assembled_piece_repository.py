from database.interface import session_scope
from database.models import AssembledPiece
from sqlalchemy import func

class AssembledPieceRepository(object):
    def __init__(self):
        pass

    def delete_all(self):
        with session_scope() as session:
            session.query(AssembledPiece).delete()
            session.flush()

    def delete_by_id(self, id: int):
        with session_scope() as session:
            session.query(AssembledPiece).filter(AssembledPiece.id == id).delete()
            session.flush()
    
    def find_by_id(self, id: int):
        with session_scope() as session:
            query = session.query(AssembledPiece).filter(AssembledPiece.id == id)
            result = query.first()
            session.flush()
            session.expunge_all()
        return result
    
    def find_by_name(self, name: str):
        with session_scope() as session:
            query = session.query(AssembledPiece).filter(AssembledPiece.name == name)
            result = query.first()
            session.flush()
            session.expunge_all()
        return result
    
    def find_all(self):
        with session_scope() as session:
            query = session.query(AssembledPiece)
            result = query.all()
            session.flush()
            session.expunge_all()
        return result
    
    def find_by_workflow_id(self, workflow_id: int):
        with session_scope() as session:
            query = session.query(AssembledPiece).filter(AssembledPiece.workflow_id == workflow_id)
            result = query.all()
            session.flush()
            session.expunge_all()
        return result
    
    def create(self, assembled_piece: AssembledPiece):
        with session_scope() as session:
            session.add(assembled_piece)
            session.flush()
            session.expunge_all()
        return assembled_piece
    
    def update(self, assembled_piece: AssembledPiece):
        with session_scope() as session:
            saved_assembled_piece = session.query(AssembledPiece).filter(AssembledPiece.id == assembled_piece.id).first()
            if saved_assembled_piece is None:
                raise ValueError(f"Assembled piece {assembled_piece.id} not found")
            updated_assembled_piece = session.merge(assembled_piece)
            session.flush()
            session.expunge_all()
        return updated_assembled_piece


    