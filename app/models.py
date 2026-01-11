from sqlalchemy import Column,Integer,String,Text,ForeignKey,Date,DateTime,Float,Boolean
from datetime import date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__="UserInfo"
    id=Column(Integer,primary_key=True,index=True)
    diagnoses=relationship("Diagnosis",back_populates="owner")
    medical_records=relationship("MedicalHistory",back_populates="owner")
    full_name=Column(String(100),nullable=False)
    email=Column(String(100),unique=True,index=True)
    hashed_password=Column(String(255),nullable=False)
    dob=Column(Date,nullable=True)
    gender=Column(String(10),nullable=True)
    blood_group=Column(String(5),nullable=True)

    @property
    def age(self):
        if self.dob:
            today=date.today()
            return today.year-self.dob.year-((today.month,today.day)<(self.dob.month,self.dob.day))
        return None

class Diagnosis(Base):
    __tablename__="Diagnosis"
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("UserInfo.id"))
    owner=relationship("User",back_populates="diagnoses")
    symptoms=Column(Text,nullable=False)
    predicted_disease=Column(String(150),nullable=False)
    treatment_advice=Column(Text,nullable=True)
    urgency=Column(String(50))
    created_at=Column(DateTime(timezone=True),server_default=func.now())

class HealthTip(Base):
    __tablename__="HealthTips"
    id=Column(Integer,primary_key=True,index=True)
    title=Column(String(200),nullable=False)
    content=Column(Text,nullable=False)

class MedicalHistory(Base):
    __tablename__="MedicalRecords"
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("UserInfo.id"),nullable=False)
    owner=relationship("User",back_populates="medical_records")
    illness=Column(String(150),nullable=False)
    doctor_name=Column(String(100),nullable=True)
    hospital_name=Column(String(150),nullable=True)
    appointment_date=Column(Date,nullable=True)
