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
    #mobile_number=Column(String(20),nullable=True)
    #address=Column(String(255),nullable=True)

    family_id = Column(String(50), nullable=True)
    family_role = Column(String(50), nullable=True)
    is_main_member = Column(Boolean, default=False) 
    sent_invites = relationship("FamilyConnection", foreign_keys="[FamilyConnection.sender_id]", back_populates="sender")
    received_invites = relationship("FamilyConnection", foreign_keys="[FamilyConnection.receiver_id]", back_populates="receiver")

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
    user_diagnosis=Column(Text,nullable=True)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    visibility=Column(String(10),default="public")

class MedicalHistory(Base):
    __tablename__="MedicalRecords"
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("UserInfo.id"),nullable=False)
    owner=relationship("User",back_populates="medical_records")
    illness=Column(String(150),nullable=False)
    doctor_name=Column(String(100),nullable=True)
    hospital_name=Column(String(150),nullable=True)
    appointment_date=Column(Date,nullable=True)

class Family(Base):
    __tablename__ = "families"
    id = Column(Integer, primary_key=True, index=True)
    family_name = Column(String(100), default="My Family")

class FamilyConnection(Base):
    __tablename__ = "family_connections"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("UserInfo.id"))
    receiver_id = Column(Integer, ForeignKey("UserInfo.id"))
    receiver_role = Column(String(50))   
    target_family_id = Column(String(50)) 
    status = Column(String(20), default="pending") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_invites")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_invites")