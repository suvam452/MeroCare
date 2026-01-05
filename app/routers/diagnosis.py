from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os
import json
import re
from app.schemas import SymptomInput , Diagnosis
from datetime import datetime


load_dotenv()


groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


router = APIRouter()


#class SymptomInput(BaseModel):
 # symptoms: str
  # age: int | None = None
   #gender: str | None = None


#class DiagnosisOutput(BaseModel):
 #   possible_diseases: list[str]
  #  first_aid: str
   # urgency: str
    #full_response: str

@router.post("/check")
async def check_symptoms(data: SymptomInput):
    """
    User sends symptoms → AI responds → we return diseases, first aid, urgency, full response.
    """
    
    prompt = f"""
IMPORTANT: You MUST reply in VALID JSON ONLY. 
NO text outside JSON. NO markdown. NO comments.
- Max 5 diseases
- Max 5 first aid tips
- Urgency must be one of: ROUTINE, URGENT, EMERGENCY

Return response EXACTLY in this format:

{{
    "predicted_disease": "most likely disease name",
    "suggested_treatment": "recommended treatment and first aid steps",
    "urgency": "ROUTINE or URGENT or EMERGENCY"
    "full response": "explanation text"
    
}}

Analyze the user's symptoms and provide:
1. The most likely disease (single disease name)
2. Suggested treatment and first aid steps
3. Urgency level (must be exactly: ROUTINE, URGENT, or EMERGENCY)

Symptoms: {data.symptoms}
Age: {data.age}
Gender: {data.gender}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Return ONLY JSON. No extra words at all."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    raw_text = response.choices[0].message.content.strip()

    print("\n====== AI RAW RESPONSE ======")
    print(raw_text)
    print("================================\n")

    try:
        parsed = json.loads(raw_text)
    except Exception:
       
        cleaned = re.sub(r"```.*?```", "", raw_text, flags=re.DOTALL)
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

        try:
            parsed = json.loads(cleaned)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI returned invalid JSON.\nError: {e}\nRaw Response:\n{raw_text}",
            )

    return Diagnosis(
        id=0, 
        predicted_disease=parsed.get("predicted_disease", "Unknown"),
        suggested_treatment=parsed.get("suggested_treatment", "Consult a healthcare professional"),
        created_at=datetime.now(),
        symptoms=", ".join(data.symptoms), 
        urgency=parsed.get("urgency", "ROUTINE"),
        full_response=raw_text
    )


@router.get("/")
def diagnosis_home():
    return {"message": "Diagnosis API is running!"}
