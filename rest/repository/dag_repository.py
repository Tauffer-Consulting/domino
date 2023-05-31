from sqlalchemy.sql import text
from database.interface import session_scope


class DagRepository(object):
    def __init__(self):
        pass

    def find_by_id(self, id):
        with session_scope() as session:
            query = text("select * from dag where dag_id=:id").bindparams(
                id=id
            )
            value = session.execute(query).first()
            value = dict(value)
        return value
