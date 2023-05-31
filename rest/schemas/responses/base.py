from pydantic import BaseModel

class PaginationSet(BaseModel):
    page: int
    records: int
    total: int
    last_page: int