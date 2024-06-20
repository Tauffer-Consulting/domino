from database.interface import session_scope
from database.models import Workflow, WorkflowPieceRepositoryAssociative
from sqlalchemy import func


class WorkflowRepository(object):
    def __init__(self):
        pass

    def delete_all(self):
        with session_scope() as session:
            session.query(Workflow).delete()
            session.flush()

    def find_by_id(self, id: int):
        with session_scope() as session:
            query = session.query(Workflow).filter(Workflow.id == id)
            result = query.first()
            session.flush()
            session.expunge_all()
        return result

    def find_by_ids(self, ids: list[int]):
        with session_scope() as session:
            result = session.query(Workflow).filter(Workflow.id.in_(ids)).all()
            session.flush()
            session.expunge_all()
        return result

    def find_by_workspace_id(
        self,
        workspace_id: int,
        page: int = 0,
        page_size: int = 100,
        filters: dict = None,
        paginate=True,
        count=True,
        descending=False
    ):
        if filters is None:
            filters = {}
        with session_scope() as session:
            query = session.query(Workflow, func.count().over().label('count')) if count else session.query(Workflow)
            query = query.filter(Workflow.workspace_id == workspace_id)\
                .order_by(Workflow.created_at.desc() if descending else Workflow.created_at.asc())

            if filters:
                query = query.magic_filters(filters)

            if paginate:
                results = query.paginate(page, page_size)
            else:
                results = query.all()
            session.flush()
            session.expunge_all()
        return results

    def find_by_name_and_workspace_id(self, name: str, workspace_id: int):
        with session_scope() as session:
            query = session.query(Workflow).filter(Workflow.name == name).filter(Workflow.workspace_id==workspace_id)
            result = query.first()
            session.flush()
            if result:
                session.expunge(result)
        return result


    def create(self, workflow: Workflow):
        with session_scope() as session:
            session.add(workflow)
            session.flush()
            session.refresh(workflow)
            session.expunge(workflow)
        return workflow


    def get_workflows_summary(self):
        with session_scope() as session:
            query = session.query(Workflow)
            result = query.all()
            session.flush()
            session.expunge_all()
        return result

    def delete_by_id(self, id: int):
        with session_scope() as session:
            result = session.query(Workflow).filter(Workflow.id==id).delete()
            session.flush()
            session.expunge_all()
        return result

    def delete_by_ids(self, ids: list[int]):
        with session_scope() as session:
            result = session.query(Workflow).filter(Workflow.id.in_(ids)).delete(synchronize_session=False)
            session.flush()
            session.expunge_all()
        return result

    def delete_by_workspace_id(self, workspace_id: int):
        with session_scope() as session:
            result = session.query(Workflow).filter(Workflow.workspace_id==workspace_id).delete(synchronize_session=False)
            session.flush()
            session.expunge_all()
        return result

    def create_workflow_piece_repositories_associations(
        self,
        workflow_piece_repository_associative: list[WorkflowPieceRepositoryAssociative]
    ):
        with session_scope() as session:
            session.add_all(workflow_piece_repository_associative)
            session.flush()
            session.expunge_all()
        return workflow_piece_repository_associative

    def count_piece_repository_dependent_workflows(self, piece_repository_id: int):
        """
        Return the count of workflows that depend on the piece repository
        """
        with session_scope() as session:
            query = session.query(Workflow.id).join(WorkflowPieceRepositoryAssociative).filter(WorkflowPieceRepositoryAssociative.piece_repository_id == piece_repository_id)
            result = query.count()
            session.flush()
            session.expunge_all()
        return result

    def find_workflows_by_piece_repository_id(self, piece_repository_id: int):
        with session_scope() as session:
            query = session.query(Workflow).join(WorkflowPieceRepositoryAssociative).filter(WorkflowPieceRepositoryAssociative.piece_repository_id == piece_repository_id)
            result = query.all()
            session.flush()
            session.expunge_all()
        return result

    def update(self, workflow: Workflow):
        with session_scope() as session:
            saved_workflow = session.query(Workflow).filter(Workflow.id == workflow.id).first()
            if not saved_workflow:
                raise Exception(f"Workflow {workflow.id} not found")
            saved_workflow.name = workflow.name
            saved_workflow.uuid_name = workflow.uuid_name
            saved_workflow.created_at = workflow.created_at
            saved_workflow.schema = workflow.schema
            saved_workflow.ui_schema = workflow.ui_schema
            saved_workflow.last_changed_at = workflow.last_changed_at
            saved_workflow.start_date = workflow.start_date
            saved_workflow.end_date = workflow.end_date
            saved_workflow.schedule = workflow.schedule
            saved_workflow.last_changed_by = workflow.last_changed_by
            session.flush()
            session.expunge(saved_workflow)
        return workflow