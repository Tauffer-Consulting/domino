from sqlalchemy.sql import text
from database.interface import session_scope


class SerializedWorkflowRepository(object):
    def __init__(self):
        pass
    
    def find_by_id(self, id):
        with session_scope() as session:
            query = text("select * from serialized_dag where dag_id=:id").bindparams(
                id=id
            )
            value = session.execute(query).first()
            value = dict(value)
        return value
    
    def get_summary_dag_data(self):
        with session_scope() as session:
            query = text('select dag_id, data, last_updated from serialized_dag')
            results = session.execute(query).fetchall()
            output = [dict(e) for e in results]
        return output