from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os
import json
import re
from app.schemas import SymptomInput , Diagnosis, SaveHistoryRequest, DiagnosisHistoryResponse
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Diagnosis as DiagnosisModel
import pytz
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
        created_at=datetime.utcnow(),
        symptoms=", ".join(data.symptoms), 
        urgency=parsed.get("urgency", "ROUTINE"),
        full_response=raw_text
    )


@router.get("/")
def diagnosis_home():
    return {"message": "Diagnosis API is running!"}

@router.post("/save-history")
async def save_history(
    request: SaveHistoryRequest,
    db: Session = Depends(get_db)
):
    try:
        # Parse as UTC time
        utc_time = datetime.fromisoformat(request.created_at.replace('Z', '+00:00'))
        
        # Convert to Nepal timezone (UTC+5:45)
        nepal_tz = pytz.timezone('Asia/Kathmandu')
        nepal_time = utc_time.astimezone(nepal_tz)
        
        # Create new diagnosis record
        new_diagnosis = DiagnosisModel(
            user_id=None,
            user_diagnosis=request.user_diagnosis,
            created_at=nepal_time,
            visibility=request.visibility
        )
        
        db.add(new_diagnosis)
        db.commit()
        db.refresh(new_diagnosis)
        
        return {
            "success": True,
            "message": "Diagnosis saved to history",
            "id": new_diagnosis.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving diagnosis: {str(e)}"
        )

@router.get("/my", response_model=list[DiagnosisHistoryResponse])
async def get_my_diagnosis_history(
    db: Session = Depends(get_db)
):
    """
    Fetch all diagnosis history from the database ordered by most recent first
    """
    try:
        diagnoses = db.query(DiagnosisModel).order_by(DiagnosisModel.created_at.desc()).all()
        
        # Transform database records to response format
        result = []
        for diagnosis in diagnoses:
            result.append(DiagnosisHistoryResponse(
                id=diagnosis.id,
                symptoms=diagnosis.user_diagnosis or "No data available",
                diagnosis_result="",  # Empty since everything is in user_diagnosis
                treatment="",
                urgency="ROUTINE",
                visibility=diagnosis.visibility,
                created_at=diagnosis.created_at
            ))
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching diagnosis history: {str(e)}"
        )
    

@router.patch("/update-visibility/{diagnosis_id}")
async def update_visibility(
    diagnosis_id: int,
    visibility: str,
    db: Session = Depends(get_db)
):
    """
    Update the visibility of a diagnosis record
    """
    try:
        # Validate visibility value
        if visibility not in ['private', 'public']:
            raise HTTPException(
                status_code=400,
                detail="Visibility must be either 'private' or 'public'"
            )
        
        # Find the diagnosis record
        diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
        
        if not diagnosis:
            raise HTTPException(
                status_code=404,
                detail="Diagnosis record not found"
            )
        
        # Update visibility
        diagnosis.visibility = visibility
        db.commit()
        db.refresh(diagnosis)
        
        return {
            "success": True,
            "message": f"Visibility updated to {visibility}",
            "id": diagnosis.id,
            "visibility": diagnosis.visibility
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error updating visibility: {str(e)}"
        )

@router.delete("/delete/{diagnosis_id}")
async def delete_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a diagnosis record from the database
    """
    try:
        # Find the diagnosis record
        diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
        
        if not diagnosis:
            raise HTTPException(
                status_code=404,
                detail="Diagnosis record not found"
            )
        
        # Delete the record
        db.delete(diagnosis)
        db.commit()
        
        return {
            "success": True,
            "message": "Diagnosis record deleted successfully",
            "id": diagnosis_id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting diagnosis: {str(e)}"
        )