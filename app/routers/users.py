from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from typing import List
from .. import database,models,schemas,oauth2

router=APIRouter()

@router.get("/",response_model=List[schemas.UserResponse])
def read_all_users(skip:int=0,limit:int=100,db:Session=Depends(database.get_db)):
    users=db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}",response_model=List[schemas.UserResponse])
def read_user(user_id:int,db:Session=Depends(database.get_db)):
    user=db.query(models.User).filter(models.User.id==user_id).first()
    return user

@router.get("/me",response_model=schemas.UserResponse)
def read_users_me(current_user:models.User=Depends(oauth2.get_current_user)):
    return current_user