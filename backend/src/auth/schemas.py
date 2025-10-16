from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class ReadUser(BaseModel):
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str