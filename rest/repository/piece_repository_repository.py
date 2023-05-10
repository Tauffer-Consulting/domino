from sqlalchemy import func
from database.interface import session_scope
from database.models import PieceRepository

class PieceRepositoryRepository(object):
    def __init__(self):
        pass

    def delete_all(self):
        with session_scope() as session:
            session.query(PieceRepository).delete()
            session.flush()

    def find_by_id(self, id: int):
        with session_scope() as session:
            query = session.query(PieceRepository).filter(PieceRepository.id == id)
            result = query.first()
            session.flush()
            if result:
                session.expunge(result)
        return result

    def find_by_ids(self, ids: list):
        with session_scope() as session:
            query = session.query(PieceRepository).filter(PieceRepository.id.in_(ids))
            result = query.all()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def find_by_workspace_id(
        self,
        workspace_id: int,
        page: int,
        page_size: int,
        filters: dict
    ) -> list:
        with session_scope() as session:
            result = session.query(PieceRepository, func.count().over().label('count'))\
                .filter(PieceRepository.workspace_id == workspace_id)\
                    .magic_filter(filters)\
                        .order_by(PieceRepository.id)\
                            .paginate(page, page_size)
            session.flush()
            session.expunge_all()
        return result

    def find_by_path(self, path: str):
        with session_scope() as session:
            result = session.query(PieceRepository).filter(PieceRepository.path == path).first()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def find_by_path_and_version(self, path: str, version: str):
        with session_scope() as session:
            result = session.query(PieceRepository).filter(PieceRepository.path == path, PieceRepository.version == version).first()
            session.flush()
            if result:
                session.expunge_all()
        return result

    def find_by_path_and_workspace_id(self, path: str, workspace_id: int):
        with session_scope() as session:
            result = session.query(PieceRepository).filter(PieceRepository.path == path, PieceRepository.workspace_id == workspace_id).first()
            session.flush()
            session.expunge_all()
        return result

    def create(self, piece_repository: PieceRepository) -> PieceRepository:
        with session_scope() as session:
            session.add(piece_repository)
            session.flush()
            session.refresh(piece_repository)
            session.expunge_all()
        return piece_repository

    def update(self, piece_repository: PieceRepository, id: int):
        with session_scope() as session:
            current_repository = session.query(PieceRepository).filter(PieceRepository.id == id).first()
            current_repository.created_at = piece_repository.created_at
            current_repository.name = piece_repository.name
            current_repository.source = piece_repository.source
            current_repository.path = piece_repository.path
            current_repository.version = piece_repository.version
            current_repository.dependencies_map = piece_repository.dependencies_map
            current_repository.compiled_metadata = piece_repository.compiled_metadata
            current_repository.workspace_id = piece_repository.workspace_id
            session.flush()
            session.refresh(current_repository)
            session.expunge_all()
        return current_repository

    def delete(self, id: int):
        with session_scope() as session:
            session.query(PieceRepository).filter(PieceRepository.id==id).delete()