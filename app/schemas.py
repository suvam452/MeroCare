from pydantic import BaseModel, EmailStr
from typing import List,Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id:Optional[int]=None

class UserBase(BaseModel):
    email:EmailStr
    full_name:str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email:str
    password:str

class UserResponse(UserBase):
    id:int

    class Config:
        from_attributes=True

class SymptomInput(BaseModel):
    symptoms:List[str]
    age:int
    gender:str

class Diagnosis(BaseModel):
    id:int
    predicted_disease:str
    suggested_treatment:str
    created_at:datetime
    symptoms:str
    urgency: str
    full_response: str

    class Config:
        from_attributes=True

class CreateMedicalRecord(BaseModel):
    illness:str
    doctor_name:Optional[str]
    hospital_name:Optional[str]
    appointment_date:Optional[str]

class MedicalRecordResponse(CreateMedicalRecord):
    id:int
    user_id:int

    class Config:
        from_attributes=True