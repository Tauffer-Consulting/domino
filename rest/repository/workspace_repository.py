from database.interface import session_scope
from database.models import Workspace, UserWorkspaceAssociative
from database.models.enums import UserWorkspaceStatus, Permission
from typing import Tuple, List
from sqlalchemy import and_, func

class WorkspaceRepository(object):
    def __init__(self):
        pass

    def find_by_name(self, name):
        with session_scope() as session:
            result = session.query(Workspace).filter(Workspace.name == name).first()
            if result:
                session.expunge(result)
        return result

    def delete_all(self):
        with session_scope() as session:
            session.query(Workspace).delete()
            session.flush()

    def update(self, workspace: Workspace) -> Workspace:
        with session_scope() as session:
            saved_workspace = session.query(Workspace).filter(Workspace.id == workspace.id).first()
            if not saved_workspace:
                raise Exception(f"Workspace {workspace.id} not found")
            saved_workspace.name = workspace.name
            saved_workspace.github_access_token = workspace.github_access_token
            session.flush()
            session.expunge(saved_workspace)
        return saved_workspace
    def create(self, workspace: Workspace) -> Workspace:
        with session_scope() as session:
            session.add(workspace)
            session.flush()
            session.refresh(workspace)
            session.expunge(workspace)
        return workspace

    def find_by_id(self, id: int) -> Workspace:
        with session_scope() as session:
            result = session.query(Workspace).filter(Workspace.id == id).first()
            if result:
                session.expunge_all()
        return result
    
    def find_pending_workspace_invite(self, user_id: int, workspace_id: int):
        with session_scope() as session:
            result = session.query(Workspace, UserWorkspaceAssociative)\
                .join(UserWorkspaceAssociative, Workspace.id==UserWorkspaceAssociative.workspace_id)\
                    .filter(and_(UserWorkspaceAssociative.user_id == user_id, UserWorkspaceAssociative.status == 'pending', Workspace.id == workspace_id))\
                        .first()
            if result:
                session.expunge_all()
        return result
    
    def update_user_workspace_associative_by_ids(self, associative: UserWorkspaceAssociative):
        with session_scope() as session:
            saved_associative = session.query(UserWorkspaceAssociative)\
                .filter(UserWorkspaceAssociative.user_id == associative.user_id)\
                    .filter(UserWorkspaceAssociative.workspace_id == associative.workspace_id)\
                        .first()
            if not saved_associative:
                return None
            saved_associative.status = associative.status
            session.flush()
            session.expunge(saved_associative)
        return saved_associative


    def find_by_id_and_user(self, id: int, user_id: int) -> Workspace:
        with session_scope() as session:
            result = session.query(Workspace.id, Workspace.name, Workspace.github_access_token, UserWorkspaceAssociative.permission, UserWorkspaceAssociative.status)\
                .filter(Workspace.id == id)\
                    .filter(UserWorkspaceAssociative.user_id == user_id)\
                        .first()
            if result:
                session.expunge_all()
        return result

    def find_by_user_id(self, user_id: int, page: int, page_size: int, return_rejected: bool = True):
        with session_scope() as session:
            query = session.query(Workspace, UserWorkspaceAssociative.permission, UserWorkspaceAssociative.status)\
                .join(UserWorkspaceAssociative)\
                    .filter(UserWorkspaceAssociative.user_id==user_id)
            if not return_rejected:
                query = query.filter(UserWorkspaceAssociative.status!=UserWorkspaceStatus.rejected.value)
            result = query.paginate(page, page_size)
            if result:
                session.expunge_all()
        return result

    def get_all(self) -> list:
        with session_scope() as session:
            results = session.query(Workspace).all()
            if results:
                session.expunge_all()
        return results

    def find_by_id_and_user_id(self, id: int, user_id: int) -> Tuple[Workspace, UserWorkspaceAssociative]:
        with session_scope() as session:
            query = session.query(Workspace.id.label('workspace_id'), Workspace.name, Workspace.github_access_token, UserWorkspaceAssociative.permission.label('permission'), UserWorkspaceAssociative.status.label('status'))\
                .outerjoin(UserWorkspaceAssociative, and_(UserWorkspaceAssociative.workspace_id==id, UserWorkspaceAssociative.user_id==user_id))\
                    .filter(Workspace.id==id)
            result = query.first()
            if result:
                session.expunge_all()
        return result

    def remove_user_from_workspaces(self, user_id: int, workspaces_ids: List[int]):
        with session_scope() as session:
            session.query(UserWorkspaceAssociative)\
                .filter(and_(UserWorkspaceAssociative.user_id==user_id, UserWorkspaceAssociative.workspace_id.in_(workspaces_ids)))\
                    .delete(synchronize_session=False)
            
    def find_user_workspaces_members_owners_count(self, user_id: int, workspaces_ids: List[int]) -> List:
        """
        SELECT * from user_workspace_associative as t1
        INNER JOIN (
            SELECT workspace_id, COUNT(*) as user_count from user_workspace_associative 
            	WHERE user_workspace_associative.workspace_id in (1) GROUP BY workspace_id
            ) as t2
            INNER JOIN (
              	SELECT workspace_id, COUNT(*) as owners_count from user_workspace_associative 
                WHERE user_workspace_associative.workspace_id in (ids) and user_workspace_associative.permission = 'owner'
              	GROUP BY workspace_id
            ) as t3
            ON t2.workspace_id=t2.workspace_id
        ON t1.workspace_id=t2.workspace_id
        WHERE t1.user_id=2;
        """
        with session_scope() as session:
            # create a subquery
            subquery_owners = session.query(
                UserWorkspaceAssociative.workspace_id, 
                func.count(UserWorkspaceAssociative.workspace_id).label('owners_count')
            ).filter(UserWorkspaceAssociative.workspace_id.in_(workspaces_ids))\
                .filter(UserWorkspaceAssociative.permission == Permission.owner.value)\
                    .group_by(UserWorkspaceAssociative.workspace_id).subquery()

            subquery = (
                session.query(
                    UserWorkspaceAssociative.workspace_id,
                    func.count(UserWorkspaceAssociative.workspace_id).label('members_count'),
                    subquery_owners.c.owners_count
                )
                .filter(UserWorkspaceAssociative.workspace_id.in_(workspaces_ids))
                .group_by(UserWorkspaceAssociative.workspace_id, subquery_owners.c.owners_count)
                .join(subquery_owners, UserWorkspaceAssociative.workspace_id == subquery_owners.c.workspace_id)
                .subquery()
            )

            query = session.query(
                UserWorkspaceAssociative.user_id,
                UserWorkspaceAssociative.workspace_id, 
                UserWorkspaceAssociative.permission,
                subquery.c.members_count,
                subquery.c.owners_count
            ).join(subquery, UserWorkspaceAssociative.workspace_id == subquery.c.workspace_id)\
                .filter(UserWorkspaceAssociative.user_id == user_id)
            result = query.all()
            if result:
                session.expunge_all()
        return result

    def find_user_workspaces_members_count(self, user_id: int, workspaces_ids: List[int]) -> List:
        """
        SQL Query:
        SELECT * from user_workspace_associative as t1
        INNER JOIN (
            SELECT workspace_id, COUNT(*) as user_count from user_workspace_associative 
            WHERE user_workspace_associative.workspace_id in (ids) GROUP BY workspace_id
            ) as t2
        ON t1.workspace_id=t2.workspace_id
        WHERE t1.user_id=2;
        """
        with session_scope() as session:
            # create a subquery
            subquery = session.query(
                UserWorkspaceAssociative.workspace_id, 
                func.count(UserWorkspaceAssociative.workspace_id).label('members_count')
            ).filter(UserWorkspaceAssociative.workspace_id.in_(workspaces_ids))\
                .group_by(UserWorkspaceAssociative.workspace_id).subquery()

            query = session.query(
                UserWorkspaceAssociative.user_id,
                UserWorkspaceAssociative.workspace_id, 
                UserWorkspaceAssociative.permission,
                subquery.c.members_count
            ).join(subquery, UserWorkspaceAssociative.workspace_id == subquery.c.workspace_id)\
                .filter(UserWorkspaceAssociative.user_id == user_id)
            result = query.all()
            if result:
                session.expunge_all()
        return result
    
    def find_by_name_and_user_id(self, name: str, user_id: int):
        with session_scope() as session:
            result = session.query(Workspace)\
                .join(UserWorkspaceAssociative)\
                    .filter(Workspace.name==name)\
                        .filter(UserWorkspaceAssociative.user_id==user_id).first()
            if result:
                session.expunge_all()
        return result


    def delete(self, id: int):
        with session_scope() as session:
            session.query(Workspace).filter(Workspace.id==id).delete()


