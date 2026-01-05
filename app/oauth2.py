from jose import jwt,JWTError
from datetime import datetime,timedelta,timezone
from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import schemas,database,models
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("No SECRET_KEY found")

ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data:dict):
    to_encode=data.copy()
    expire=datetime.now(timezone.utc)+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(database.get_db)):
    credentials_exception=HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Failed to validate credentials",headers={"WWW-Authenticate":"Bearer"})
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id:str=payload.get("user_id")

        if user_id is None:
            raise credentials_exception
        
        token_data=schemas.TokenData(user_id=int(user_id))
    except JWTError:
        raise credentials_exception
    
    user=db.query(models.User).filter(models.User.id==token_data.user_id).first()
    if user is None:
        raise credentials_exception
    
    return user