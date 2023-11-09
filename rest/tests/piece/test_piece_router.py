import json
import pytest
from httpx import Response
from typing import List

pytest_plugins = [
    "tests.piece.fixtures"
]

@pytest.mark.usefixtures("register", "login", "add_piece_repository", "teardown_piece_repository")
class TestPieceRouter:
    @staticmethod
    def test_get_pieces(get_pieces: Response, get_pieces_mock_response: List):
        mock_response = get_pieces_mock_response        
        response = get_pieces        
        content = response.json()

        assert response.status_code == 200
        
        mock_response_content = json.loads(mock_response[0].model_dump_json())
        assert content[0].keys() == mock_response_content.keys()

        for count, piece in enumerate(content):
            if count >= 2:
                break
            for key in piece:
                if key == "id":
                    continue
                mock_response_content = json.loads(mock_response[count].model_dump_json())
                assert piece.get(key) == mock_response_content.get(key)

    @staticmethod
    @pytest.mark.parametrize("get_pieces_pagination", [{"page": 0, "page_size": 1}, {"page": 1, "page_size": 2}], indirect=True)
    def test_get_pieces_pagination(get_pieces: Response, get_pieces_pagination: Response):
        all_pieces = get_pieces.json()
        response = get_pieces_pagination
        content = response.json()
        if len(content) == 1: #based on page and page_size parameters fixture
            for key in content[0].keys():
                assert content[0].get(key) == all_pieces[0].get(key)
        if len(content) == 2: #based on page and page_size parameters fixture
            for count, piece in enumerate(content):
                for key in piece:
                    assert piece.get(key) == all_pieces[count+2].get(key)

    @staticmethod
    @pytest.mark.parametrize("get_piece_by_name", [{"name": "SimpleLogPiece"}], indirect=True)
    def test_get_piece_by_name(get_pieces: Response, get_piece_by_name: Response):
        all_pieces = get_pieces.json()
        response = get_piece_by_name
        content = response.json()
        for i in content:
            if i.get("name") == "SimpleLogPiece":
                for j in all_pieces:
                    if j.get("name") == "SimpleLogPiece":
                        for key in i.keys():
                            assert i.get(key) == j.get(key)

