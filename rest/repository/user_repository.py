from requests import session
from database.interface import session_scope
from database.models import User, Workspace, UserWorkspaceAssociative
from schemas.exceptions.base import ResourceNotFoundException


class UserRepository(object):
    def __init__(self):
        pass

    def add_workspace(self, user_id: int, workspace: Workspace, associative: UserWorkspaceAssociative) -> User:
        with session_scope() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception(f"User {id} not found")
            associative.workspace = workspace
            user.workspaces.append(associative)
            session.flush()
            session.expunge_all()
        return user


    def delete_all(self):
        with session_scope() as session:
            session.query(User).delete()
            session.flush()
    
    def delete(self, user_id: int):
        with session_scope() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                raise ResourceNotFoundException('User not found')
            session.delete(user)
            session.flush()
            session.expunge_all()

    def find_by_id(self, id: int) -> User:
        with session_scope() as session:
            result = session.query(User).filter(User.id == id).first()
            session.flush()
            session.expunge_all()
        return result

    def update(self, user: User) -> User:
        with session_scope() as session:
            saved_user = session.query(User).filter(User.id == user.id).first()
            if not saved_user:
                raise Exception(f"User {user.id} not found")
            #saved_user.email = user.email
            #saved_user.password = user.password
            saved_user.user_group_id = user.user_group_id
            session.flush()
            session.expunge(saved_user)
        return saved_user


    def get_user_by_email(self, email: str)-> User:
        with session_scope() as session:
            result = session.query(User).filter(User.email == email).first()
            session.flush()
            session.expunge_all()
        return result
    
    def create(self, user: User) -> User:
        with session_scope() as session:
            session.add(user)
            session.flush()
            session.refresh(user)
            session.expunge(user)
        return user




