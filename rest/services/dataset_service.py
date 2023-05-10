from pathlib import Path
from core.logger import get_configured_logger
# from repository.dataset_repository import DatasetRepository


class DatasetService(object):
    def __init__(self) -> None:
        # self.dataset_repository = DatasetRepository()

        self.logger = get_configured_logger(self.__class__.__name__)

    def get_datasets_info(self, dataset_id: str = None):
        try:
            all_datasets = self.dataset_repository.find_all()
            data = list()
            for ds in all_datasets:
                data.append({
                    "dataset_id": ds.dataset_id,
                    "description": ds.description,
                    "type": ds.type,
                    "created": ds.created.isoformat(),
                    "last_modified": ds.last_modified.isoformat(),
                    "size": ds.size,
                })
            return data
        except Exception as e:
            self.logger.exception(e)
            raise e
    
    def create_dataset(self, data):
        try:
            self.dataset_repository.create_dataset(data=data)
        except Exception as e:
            self.logger.exception(e)
            raise e