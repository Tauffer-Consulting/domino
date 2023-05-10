from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

# Create a declarative base for each (currently, only one Base is created and used)

Base = declarative_base()

class BaseDatabaseModel(object):
    def to_serializable_dict(self):
        maped_object = dict()
        for column in self.__table__.columns:
            if issubclass(type(getattr(self, column.name)), enum.Enum):
                maped_object[column.name] = getattr(self, column.name).value
            elif issubclass(type(getattr(self, column.name)), datetime):
                maped_object[column.name] = getattr(self, column.name).strftime("%Y-%m-%d %H:%M:%S")
            else:
                maped_object[column.name] = getattr(self, column.name)
        return maped_object

    def to_dict(self):
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
