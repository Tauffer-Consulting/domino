import requests


class ApiTestClient(requests.Session):
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url

    def request(self, method, resource, **kwargs):
        try:
            if not resource.startswith('/'):
                resource = f'/{resource}'
            url = f'{self.base_url}{resource}'
            return super(ApiTestClient, self).request(method, url, **kwargs)
        except Exception as e:
            raise e



