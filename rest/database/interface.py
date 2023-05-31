import sqlalchemy as sqla
import contextlib
from sqlalchemy.orm import sessionmaker, scoped_session
from core.settings import settings
from database.query import CustomQuery


class DBInterface:
    def __init__(self):
        self._connect()

    def _connect(self):
        # Creates database engines
        self.engine = sqla.create_engine(url=settings.DB_URL)

        self.data_session_maker = sessionmaker(autoflush=True)
        self.data_session_maker.configure(bind=self.engine, query_cls=CustomQuery)

        self.Session = scoped_session(self.data_session_maker)

db = DBInterface()

@contextlib.contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = db.Session()

    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
