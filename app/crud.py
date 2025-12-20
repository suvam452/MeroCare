from sqlalchemy.orm import Session
from .import models,schemas,utils

def get_user_by_email(db:Session,email:str):
    return db.query(models.User).filter(models.User.email==email).first()

def create_user(db:Session,user:schemas.UserCreate):
    hashed_password=utils.Hash.bcrypt(user.password)
    db_user=models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user