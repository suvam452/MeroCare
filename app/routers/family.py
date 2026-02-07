from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, oauth2, utils
from sqlalchemy import or_, and_

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

@router.get("/list/{user_id}", response_model=List[schemas.FamilyMemberResponse], tags=["Family"])
def get_family_members(user_id: int, db: Session = Depends(database.get_db)):
    """Get list of all members in the same family group with smart relationship inference"""
    
    # Get the requesting user
    myself = db.query(models.User).filter(models.User.id == user_id).first()
    if not myself:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If user is not in any family, return only themselves
    if not myself.family_id:
        self_data = schemas.UserResponse.model_validate(myself).model_dump()
        self_data['role'] = "Self"
        return [self_data]
    
    # Get ALL users with the same family_id
    family_members = db.query(models.User).filter(
        models.User.family_id == myself.family_id
    ).all()
    
    # Get ALL connections in this family for relationship inference
    all_connections = db.query(models.FamilyConnection).filter(
        models.FamilyConnection.target_family_id == myself.family_id,
        models.FamilyConnection.status == "accepted"
    ).all()
    
    # Build a relationship map: {(user1_id, user2_id): role}
    relationship_map = {}
    for conn in all_connections:
        # Direct relationship: sender → receiver
        relationship_map[(conn.sender_id, conn.receiver_id)] = conn.receiver_role
        # Reverse relationship: receiver → sender
        reverse_role = utils.INVERSE_RELATIONS.get(conn.receiver_role, "Family Member")
        relationship_map[(conn.receiver_id, conn.sender_id)] = reverse_role
    
    family_members_data = []
    
    # Process each family member
    for member in family_members:
        if member.id == user_id:
            # This is the requesting user - always show as "Self"
            member_data = schemas.UserResponse.model_validate(member).model_dump()
            member_data['role'] = "Self"
            family_members_data.append(member_data)
        else:
            # Check if there's a direct relationship
            role_to_display = relationship_map.get((user_id, member.id))
            
            # If no direct relationship, try to infer through a common connection
            if not role_to_display or role_to_display == "Family Member":
                role_to_display = infer_relationship(
                    user_id, 
                    member.id, 
                    all_connections, 
                    relationship_map
                )
            
            # Apply gender-based role names
            role_to_display = apply_gender_to_role(role_to_display, member.gender)
            
            member_data = schemas.UserResponse.model_validate(member).model_dump()
            member_data['role'] = role_to_display
            family_members_data.append(member_data)
    
    return family_members_data


def infer_relationship(user_a_id: int, user_b_id: int, connections, relationship_map) -> str:
    """
    Infer relationship between two users through common connections.
    For example: If A's father is B's spouse, then B is A's mother/father.
    """
    
    # Try to find a common person both are connected to
    a_connections = {}  # {connected_person_id: role_from_a's_perspective}
    b_connections = {}  # {connected_person_id: role_from_b's_perspective}
    
    for conn in connections:
        # Build A's connections
        if conn.sender_id == user_a_id:
            a_connections[conn.receiver_id] = conn.receiver_role
        elif conn.receiver_id == user_a_id:
            reverse_role = utils.INVERSE_RELATIONS.get(conn.receiver_role, "Family Member")
            a_connections[conn.sender_id] = reverse_role
        
        # Build B's connections
        if conn.sender_id == user_b_id:
            b_connections[conn.receiver_id] = conn.receiver_role
        elif conn.receiver_id == user_b_id:
            reverse_role = utils.INVERSE_RELATIONS.get(conn.receiver_role, "Family Member")
            b_connections[conn.sender_id] = reverse_role
    
    # Find common connections
    common_people = set(a_connections.keys()) & set(b_connections.keys())
    
    for common_id in common_people:
        a_to_common = a_connections[common_id]  # A's relationship to common person
        b_to_common = b_connections[common_id]  # B's relationship to common person
        
        # Infer A's relationship to B based on common connection
        inferred = infer_through_common(a_to_common, b_to_common)
        if inferred and inferred != "Family Member":
            return inferred
    
    # If we can't infer, return generic
    return "Family Member"


def infer_through_common(my_role_to_common: str, their_role_to_common: str) -> str:
    """
    Infer relationship based on a common person.
    Example: If I call someone "Father" and another person calls them "Spouse",
    that person is likely my "Mother" or "Father" (parent).
    """
    
    # Parent relationships
    if my_role_to_common in ["Father", "Mother", "Parent"]:
        if their_role_to_common == "Spouse":
            return "Parent"  # My parent's spouse is also my parent
        elif their_role_to_common in ["Son", "Daughter", "Child"]:
            return "Sibling"  # My parent's child is my sibling
    
    # Child relationships
    elif my_role_to_common in ["Son", "Daughter", "Child"]:
        if their_role_to_common in ["Son", "Daughter", "Child"]:
            return "Sibling"  # My parent's other child is my sibling
        elif their_role_to_common == "Spouse":
            return "Parent"  # My child's spouse is my child-in-law (simplified to Parent)
    
    # Sibling relationships
    elif my_role_to_common in ["Brother", "Sister", "Sibling"]:
        if their_role_to_common in ["Father", "Mother", "Parent"]:
            return "Parent"  # My sibling's parent is my parent
        elif their_role_to_common in ["Son", "Daughter", "Child"]:
            return "Sibling"  # My parent's child is my sibling
    
    # Spouse relationships
    elif my_role_to_common == "Spouse":
        if their_role_to_common in ["Son", "Daughter", "Child"]:
            return "Child"  # My spouse's child could be my child
        elif their_role_to_common in ["Father", "Mother", "Parent"]:
            return "Parent"  # My spouse's parent is my parent-in-law (simplified)
    
    return "Family Member"


def apply_gender_to_role(role: str, gender: str) -> str:
    """Apply gender-specific names to generic roles"""
    if not gender:
        return role
    
    gender_lower = gender.lower()
    
    if role == "Parent":
        if gender_lower == "male":
            return "Father"
        elif gender_lower == "female":
            return "Mother"
    elif role == "Child":
        if gender_lower == "male":
            return "Son"
        elif gender_lower == "female":
            return "Daughter"
    elif role == "Sibling":
        if gender_lower == "male":
            return "Brother"
        elif gender_lower == "female":
            return "Sister"
    
    return role
@router.get("/member-history/{target_user_id}", tags=["Family"])
def get_member_history(target_user_id: int, requester_id: int, db: Session = Depends(database.get_db)):
    """Allow family members to see each other's PUBLIC medical records"""
    target = db.query(models.User).filter(models.User.id == target_user_id).first()
    requester = db.query(models.User).filter(models.User.id == requester_id).first()
    
    if not target or not requester:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Authorization: Check if both users are in the same family
    if not target.family_id or not requester.family_id:
        raise HTTPException(status_code=403, detail="Unauthorized: User not in a family group")
        
    if target.family_id != requester.family_id: 
        raise HTTPException(status_code=403, detail="Unauthorized: Not in the same family group")
    
    # Filter only PUBLIC diagnoses
    diagnoses = db.query(models.Diagnosis).filter(
        models.Diagnosis.user_id == target_user_id,
        models.Diagnosis.visibility == "public"
    ).all()
    
    return {
        "full_name": target.full_name, 
        "history": diagnoses
    }

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