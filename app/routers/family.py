from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, oauth2, utils
from sqlalchemy import or_

router=APIRouter()

@router.post("/invite", tags=["Family"])
def send_invite(request:schemas.FamilyInviteRequest, db: Session = Depends(database.get_db)):
    """Invite someone to your family group via email"""
    print(f"DEBUG: Searching for email: '{request.receiver_email}'")
    sender = db.query(models.User).filter(models.User.id == request.sender_id).first()
    receiver = db.query(models.User).filter(models.User.email == request.receiver_email).first()
    if not receiver: 
        raise HTTPException(status_code=404, detail="User not found")

    # If sender doesn't have a family group yet, create one
    if not sender.family_id:
        new_family_entry = models.Family(family_name=f"{sender.full_name}'s Family")
        db.add(new_family_entry)
        db.flush() 
        sender.family_id = str(new_family_entry.id) 
        db.commit()

    new_invite = models.FamilyConnection(
        sender_id=sender.id, 
        receiver_id=receiver.id,
        receiver_role=request.role_for_receiver, 
        target_family_id=sender.family_id
    )
    db.add(new_invite)
    db.commit()
    return {"message": "Invitation Sent"}

@router.get("/pending-requests/{user_id}", tags=["Family"])
def get_pending_invites(user_id: int, db: Session = Depends(database.get_db)):
    """List invitations waiting for this user"""
    invites = db.query(models.FamilyConnection).filter(
        models.FamilyConnection.receiver_id == user_id, 
        models.FamilyConnection.status == "pending"
    ).all()
    results = []
    for i in invites:
        sender = db.query(models.User).filter(models.User.id == i.sender_id).first()
        results.append({
            "invite_id": i.id, 
            "from_name": sender.full_name if sender else "Unknown", 
            "assigned_role": i.receiver_role
        })
    return results

@router.post("/accept/{request_id}", tags=["Family"])
def accept_invite(request_id: int, db: Session = Depends(database.get_db)):
    """Accept an invite"""
    invite = db.query(models.FamilyConnection).filter(models.FamilyConnection.id == request_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    receiver = db.query(models.User).filter(models.User.id == invite.receiver_id).first()
    if receiver and not receiver.family_id: # Only update if they aren't in a family already
        receiver.family_id = invite.target_family_id
    invite.status = "accepted"
    db.commit()
    return {"message": "Joined Family"}

@router.get("/list/{user_id}", response_model=List[schemas.FamilyMemberResponse],tags=["Family"])
def get_family_members(user_id: int, db: Session = Depends(database.get_db)):
    """Get list of all members connected to this user"""
    myself = db.query(models.User).filter(models.User.id == user_id).first()
    if not myself:
        raise HTTPException(status_code=404, detail="User not found")
        
    family_members_data = []
    self_data = schemas.UserResponse.model_validate(myself).model_dump()
    self_data['role'] = "Self"
    family_members_data.append(self_data)
    
    seen_ids = {user_id}

    connections = db.query(models.FamilyConnection).filter(
        or_(
            models.FamilyConnection.sender_id == user_id,
            models.FamilyConnection.receiver_id == user_id
        ),
        models.FamilyConnection.status == "accepted"
    ).all()

    for conn in connections:
        if conn.sender_id == user_id:
            target_user = conn.receiver
            sender_role = conn.receiver_role
            role_to_display = conn.receiver_role
            
        else:
            target_user = conn.sender
            sender_role = conn.receiver_role 
            role_to_display = utils.INVERSE_RELATIONS.get(sender_role, "Family Member")

        if role_to_display == "Parent":
            if target_user.gender and target_user.gender.lower() == "male":
                role_to_display = "Father"
            elif target_user.gender and target_user.gender.lower() == "female":
                role_to_display = "Mother"
            else:
                role_to_display = "Parent"
        elif role_to_display == "Child":
                if target_user.gender and target_user.gender.lower() == "male":
                    role_to_display = "Son"
                elif target_user.gender and target_user.gender.lower() == "female":
                    role_to_display = "Daughter"
                else:
                    role_to_display = "Child"
        else:
            role_to_display = role_to_display
            
        if target_user.id not in seen_ids:
            member_data = schemas.UserResponse.model_validate(target_user).model_dump()
            member_data['role'] = role_to_display
            
            family_members_data.append(member_data)
            seen_ids.add(target_user.id)
    return family_members_data

@router.get("/member-history/{target_user_id}", tags=["Family"])
def get_member_history(target_user_id: int, requester_id: int, db: Session = Depends(database.get_db)):
    """Allow family members to see each other's medical records"""
    target = db.query(models.User).filter(models.User.id == target_user_id).first()
    requester = db.query(models.User).filter(models.User.id == requester_id).first()
    
    if not target or not requester:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target.family_id != requester.family_id: 
        raise HTTPException(status_code=403, detail="Unauthorized: Not in the same family group")
        
    diagnoses = db.query(models.Diagnosis).filter(models.Diagnosis.user_id == target_user_id).all()
    return {"full_name": target.full_name, "history": diagnoses}

@router.get("/sent-invites", tags=["Family"])
def get_sent_invites(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """List all invitations sent BY the current user (pending, accepted, or denied)"""
    
    invites = db.query(models.FamilyConnection).filter(
        models.FamilyConnection.sender_id == current_user.id
    ).all()
    
    results = []
    for i in invites:
        receiver = db.query(models.User).filter(models.User.id == i.receiver_id).first()
        results.append({
            "invite_id": i.id, 
            "to_name": receiver.full_name if receiver else "Unknown/Deleted User", 
            "status": i.status,
            "assigned_role": i.receiver_role
        })
    return results

@router.post("/reject/{request_id}", tags=["Family"])
def reject_invite(request_id: int, db: Session = Depends(database.get_db)):
    """Reject a family invitation"""
    invite = db.query(models.FamilyConnection).filter(models.FamilyConnection.id == request_id).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
        
    db.delete(invite)
    db.commit()
    
    return {"message": "Invitation rejected and removed"}