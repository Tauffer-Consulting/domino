from database.interface import session_scope
from database.models import Secret
from typing import List


class SecretRepository(object):
    def __init__(self):
        pass

    def create(self, secret: Secret) -> Secret:
        with session_scope() as session:
            session.add(secret)
            session.flush()
            session.refresh(secret)
            session.expunge(secret)
        return secret

    def find_by_id(self, id: int) -> Secret:
        with session_scope() as session:
            result = session.query(Secret).filter(Secret.id == id).first()
            if result:
                session.expunge(result)
        return result

    def find_by_name_and_piece_repository_id(self, name: str, piece_repository_id: int):
        with session_scope() as session:
            result = session.query(Secret)\
                .filter(Secret.piece_repository_id == piece_repository_id)\
                    .filter(Secret.name == name)\
                        .first()
            if result:
                session.expunge(result)
        return result

    def delete_by_piece_repository_id_and_not_names(self, names: List[str], piece_repository_id: int):
        with session_scope() as session:
            query = session.query(Secret)\
                .filter(Secret.piece_repository_id == piece_repository_id)\
                    .filter(Secret.name.not_in(names))
            query.delete()

    def find_by_piece_repository_id(self, piece_repository_id: int):
        with session_scope() as session:
            result = session.query(Secret).filter(Secret.piece_repository_id == piece_repository_id).order_by(Secret.piece_repository_id, Secret.name).all()
            if result:
                session.expunge_all()
        return result

    def update(self, secret: Secret, secret_id: int):
        with session_scope() as session:
            saved_secret = session.query(Secret).filter(Secret.id == secret_id).first()
            if not saved_secret:
                raise Exception(f"Secret {secret_id} not found")
            saved_secret.name = secret.name
            saved_secret.value = secret.value
            saved_secret.piece_repository_id = secret.piece_repository_id
            session.flush()
            session.expunge(saved_secret)
        return saved_secret

