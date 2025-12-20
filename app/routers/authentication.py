from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from .. import database,schemas,models,utils,crud

router=APIRouter()

@router.post("/signup",response_model=schemas.UserResponse)
def create_user(user:schemas.UserCreate,db:Session=Depends(database.get_db)):
    db_user=crud.get_user_by_email(db,email=user.email)
    if db_user:
        raise HTTPException(status_code=400,detail="Email already registered")
    return crud.create_user(db=db,user=user)

@router.post("/login")
def login(user_credentials:schemas.UserLogin,db:Session=Depends(database.get_db)):
    user=crud.get_user_by_email(db,email=user_credentials.email)
    if not user or not utils.Hash.verify(user_credentials.password,user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Invalid Credentials")
    return {"message":"Login Successful","user_id":user.id}