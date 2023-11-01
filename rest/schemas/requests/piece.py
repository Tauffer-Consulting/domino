from pydantic import BaseModel
from typing import Optional

class ListPiecesFilters(BaseModel):
    name__like: Optional[str] = None
