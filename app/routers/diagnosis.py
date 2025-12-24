from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os
import json
import re


load_dotenv()


groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


router = APIRouter()


class SymptomInput(BaseModel):
    symptoms: str
    age: int | None = None
    gender: str | None = None


class DiagnosisOutput(BaseModel):
    possible_diseases: list[str]
    first_aid: list[str]
    urgency: str
    full_response: str


