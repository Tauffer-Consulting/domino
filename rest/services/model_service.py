from core.logger import get_configured_logger


class ModelService(object):

    def __init__(self) -> None:
        self.logger = get_configured_logger(self.__class__.__name__)

    def get_models_info(self, model_id: str = None):
        try:
            all_models = self.model_repository.find_all()
            data = list()
            for ds in all_models:
                data.append({
                    # "dataset_id": ds.dataset_id,
                    # "description": ds.description,
                    # "type": ds.type,
                    # "created": ds.created.isoformat(),
                    # "last_modified": ds.last_modified.isoformat(),
                    # "size": ds.size,
                })
            return data
        except Exception as e:
            self.logger.exception(e)
            raise e