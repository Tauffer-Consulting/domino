from ..api_test_client import ApiTestClient
from database.models.user import User
import pytest
from typing import Dict


@pytest.mark.usefixtures("register", "login")
class TestUserRouter:
    @staticmethod
    def test_delete_user(client: ApiTestClient, user: User, authorization_token: Dict):
        response = client.delete(
            f"/users/{user.id}",
            headers={"Authorization": authorization_token["header"]}
        )
        assert response.status_code == 200
        
