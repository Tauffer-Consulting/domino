from typing import List
from sqlalchemy import func
from database.interface import session_scope
from database.models.piece import Piece

class PieceRepository(object):
    def __init__(self):
        pass

    def delete_all(self):
        with session_scope() as session:
            session.query(Piece).delete()
            session.flush()

    def find_by_ids(self, ids: list):
        with session_scope() as session:
            query = session.query(Piece).filter(Piece.id.in_(ids))
            result = query.all()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def find_by_id(self, id: int):
        with session_scope() as session:
            query = session.query(Piece).filter(Piece.id == id)
            result = query.first()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def find_by_repository_id(self, repository_id: int, page: int, page_size: int, filters: dict):
        with session_scope() as session:
            results = session.query(Piece)\
                .filter(Piece.repository_id == repository_id)\
                    .magic_filter(filters)\
                        .order_by(Piece.id)\
                            .paginate(page, page_size)
            session.flush()
            session.expunge_all()
        return results
    
    def find_all(self):
        with session_scope() as session:
            query = session.query(Piece)
            results = query.all()
            session.flush()
            session.expunge_all()
        return results

    # def find_by_user_group_ids(self, user_group_ids: int):
    #     with session_scope() as session:
    #         query = session.query(Piece).filter(Piece.user_group_id.in_(user_group_ids))
    #         results = query.all()
    #         session.flush()
    #         session.expunge_all()
    #     return results

    def find_by_name(self, name: str):
        with session_scope() as session:
            query = session.query(Piece).filter(Piece.name == name)
            result = query.first()
            session.flush()
            if result:
                session.expunge(result)
        return result

    def find_by_name_and_repository_id(self, name: str, repository_id: int):
        with session_scope() as session:
            query = session.query(Piece).filter(Piece.name == name).filter(Piece.repository_id == repository_id)
            result = query.first()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def get_piece_secrets_names_by_repository_id(self, name: str, repository_id: int):
        with session_scope() as session:
            result = session.query(func.json_object_keys(Piece.secrets_schema['properties']))\
                .filter(Piece.name == name)\
                    .filter(Piece.repository_id == repository_id)\
                        .all()
            session.expunge_all()
        return result

    def create_many(self, pieces: List[Piece]):
        with session_scope() as session:
            session.add_all(pieces)
            session.flush()
            session.expunge_all()
        return pieces

    def create(self, piece: Piece):
        with session_scope() as session:
            session.add(piece)
            session.flush()
            session.refresh(piece)
            session.expunge(piece)
        return piece

    def update(self, piece: Piece, piece_id: int,):
        with session_scope() as session:
            saved_piece = session.query(Piece).filter(Piece.id == piece_id).first()
            if not saved_piece:
                raise Exception(f"Piece {piece.name} not found")
            saved_piece.name = piece.name
            saved_piece.input_schema = piece.input_schema
            saved_piece.output_schema = piece.output_schema
            saved_piece.secrets_schema = piece.secrets_schema
            saved_piece.source_image = piece.source_image
            saved_piece.style = piece.style
            saved_piece.description = piece.description
            saved_piece.repository_id=piece.repository_id
            session.flush()
            session.expunge(saved_piece)
        return saved_piece

    def find_pieces_by_names(self, names: list):
        with session_scope() as session:
            query = session.query(Piece).filter(Piece.name.in_(names))
            results = query.all()
            session.flush()
            session.expunge_all()
        return results
    

