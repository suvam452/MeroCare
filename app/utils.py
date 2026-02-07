from passlib.context import CryptContext

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

INVERSE_RELATIONS = {
    "Father": "Child",
    "Mother": "Child",
    "Son": "Parent",
    "Daughter": "Parent",
    "Spouse": "Spouse",
    "Brother": "Sibling",
    "Sister": "Sibling",
    "Guardian": "Ward",
    "Ward": "Guardian",
}

class Hash:
    @staticmethod
    def bcrypt(password:str):
        return pwd_context.hash(password)
    
    @staticmethod
    def verify(plain_password,hashed_password):
        return pwd_context.verify(plain_password,hashed_password)