from pydantic import BaseModel


# def to_camel(string: str) -> str:
#     return ''.join(word.capitalize() for word in string.split('_'))


BaseRequestModel = BaseModel
# class BaseRequestModel(BaseModel):

#     class Config:
#         alias_generator = to_camel