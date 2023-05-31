from apis.workflow.models import Dataset 


# TODO MOVE TO apis.dataset.models
class DatasetRepository(object):
    def __init__(self):
        pass

    def find_all(self):
        return Dataset.objects.all()

    def find_by_user_id(self, user_id):
        value = Dataset.objects.filter(user_id=user_id)

    def create_dataset(self, data):
        ds = Dataset(**data)
        ds.save()