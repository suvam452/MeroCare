from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from .. import database,schemas,models,utils,crud,oauth2
from fastapi.security import OAuth2PasswordRequestForm

router=APIRouter()

@router.post("/signup",response_model=schemas.UserResponse)
def create_user(user:schemas.UserCreate,db:Session=Depends(database.get_db)):
    db_user=crud.get_user_by_email(db,email=user.email)
    if db_user:
        raise HTTPException(status_code=400,detail="Email already registered")
    return crud.create_user(db=db,user=user)

@router.post("/login",response_model=schemas.Token)
def login(user_credentials:schemas.UserLogin,db:Session=Depends(database.get_db)):
    user=crud.get_user_by_email(db,email=user_credentials.email)
    if not user or not utils.Hash.verify(user_credentials.password,user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Invalid Credentials")
    access_token=oauth2.create_access_token(data={"user_id":str(user.id)})
    return {"access_token":access_token,"token_type":"bearer"}