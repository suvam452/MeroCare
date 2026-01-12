from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database,models,schemas,oauth2,utils

router=APIRouter()

@router.get("/me",response_model=schemas.UserResponse)
def read_users_me(current_user:models.User=Depends(oauth2.get_current_user)):
    return current_user

@router.get("/",response_model=List[schemas.UserResponse])
def read_all_users(skip:int=0,limit:int=100,db:Session=Depends(database.get_db)):
    users=db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}",response_model=schemas.UserResponse)
def read_user(user_id:int,db:Session=Depends(database.get_db)):
    user=db.query(models.User).filter(models.User.id==user_id).first()
    return user

@router.put("/me",response_model=schemas.UserResponse)
def update_user_profile(user_update:schemas.UserUpdate,db:Session=Depends(database.get_db),current_user:models.User=Depends(oauth2.get_current_user)):
    if user_update.full_name is not None:
        current_user.full_name=user_update.full_name
    if user_update.mobile_number is not None:
        current_user.mobile_number=user_update.mobile_number
    if user_update.address is not None:
        current_user.address=user_update.address
    if user_update.blood_group is not None:
        current_user.blood_group=user_update.blood_group
    if user_update.dob is not None:
        current_user.dob=user_update.dob
    if user_update.gender is not None:
        current_user.gender=user_update.gender
    
    db.commit()
    db.refresh(current_user)

    return current_user

@router.post("/change_password")
def change_password(pass_data:schemas.UserPasswordChange,db:Session=Depends(database.get_db),current_user:models.User=Depends(oauth2.get_current_user)):
    if not utils.Hash.verify(pass_data.old_password,current_user.hashed_password):
        raise HTTPException(status_code=403,detail="Old password is incorrect")
    current_user.hashed_password=utils.Hash.bcrypt(pass_data.new_password)
    db.commit()
    return{"message":"Password Updated successfully"}