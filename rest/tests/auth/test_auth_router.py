from httpx import Response
import json
from typing import Dict

from schemas.responses.auth import RegisterResponse, LoginResponse
from database.models.user import User

pytest_plugins=[
    "tests.auth.fixtures"
]

class TestAuthRouter:
    @staticmethod
    def test_register(user: User, register: Response, authorization_token: Dict):
        mock_response = RegisterResponse(
            id=1,
            email=user.email, 
            workspaces_ids=[1], 
            access_token="access_token"
        )
        response = register
        content = response.json()
        mock_response_content = json.loads(mock_response.json())

        assert response.status_code == 201
        assert content["email"] == mock_response_content["email"]
        assert content.keys() == mock_response_content.keys()

    @staticmethod
    def test_login(user: User, register: Response, login: Response, authorization_token: Dict):
        mock_response = LoginResponse(
            user_id=user.id,
            email=user.email, 
            workspaces_ids=[1], 
            access_token=authorization_token["header"].split(' ')[1]
        )
        response = login
        content = response.json()
        mock_response_content = json.loads(mock_response.json())

        assert response.status_code == 200
        assert content.keys() == mock_response_content.keys()
        for key in content:
            if key != "workspaces_ids":
                assert content.get(key) == mock_response_content.get(key)
