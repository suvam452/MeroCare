from pydantic import BaseModel, EmailStr
from typing import List,Optional
from datetime import datetime,date

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id:Optional[int]=None

class UserBase(BaseModel):
    email:EmailStr
    full_name:str
  
    blood_group:Optional[str]=None
    dob:Optional[date]=None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email:str
    password:str

class UserResponse(UserBase):
    id:int
    mobile_number:Optional[str]=None
    address:Optional[str]=None
    blood_group:Optional[str]=None
    dob:Optional[date]=None
    gender:Optional[str]=None

    class Config:
        from_attributes=True

class UserUpdate(BaseModel):
    full_name:Optional[str]=None
    mobile_number:Optional[str]=None
    address:Optional[str]=None
    blood_group:Optional[str]=None
    dob:Optional[date]=None
    gender:Optional[str]=None

class UserPasswordChange(BaseModel):
    old_password:str
    new_password:str

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

class SaveHistoryRequest(BaseModel):
    user_diagnosis: str
    visibility: str
    created_at: str
    
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

class DiagnosisHistoryResponse(BaseModel):
    id: int
    symptoms: str
    diagnosis_result: str
    treatment: str
    urgency: str
    visibility: str
    created_at: datetime

    class Config:
        from_attributes = True