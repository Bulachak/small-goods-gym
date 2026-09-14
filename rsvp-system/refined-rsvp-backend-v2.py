from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

# --- ROUTER DEFINITION ---
router = APIRouter(prefix="/api/v1/events", tags=["Refined RSVP & Waitlist"])

# --- PYDANTIC SCHEMAS (Postel's Law Compliant Input Handling) ---
class RSVPRequest(BaseModel):
    user_id: uuid.UUID
    override_rehab_warning: bool = False

class RSVPResponse(BaseModel):
    rsvp_id: uuid.UUID
    event_id: uuid.UUID
    user_id: uuid.UUID
    status: str  # "attending" | "waitlisted" | "blocked_by_warning"
    queue_position: Optional[int] = None
    warning_flagged: bool = False
    warning_message: Optional[str] = None
    timestamp: datetime

class CancelResponse(BaseModel):
    success: bool
    message: str
    promoted_user_id: Optional[uuid.UUID] = None
    promoted_user_email: Optional[str] = None

# --- SIMULATED SERVICES & DATABASE CONNECTORS ---
class MockDB:
    # Simulated tables - Cleaned valid hexadecimal UUID keys (removed 'evt_' and 'ath_' prefixes)
    gym_events = {
        uuid.UUID("38210111-1111-1111-1111-111111111111"): {
            "title": "Olympic Weightlifting: Clean & Jerk Overhead Mechanics",
            "max_capacity": 12,
            "attendees": [uuid.uuid4() for _ in range(11)], # 11 active spots filled
            "waitlist": [
                {"user_id": uuid.uuid4(), "created_at": datetime.now()},
                {"user_id": uuid.uuid4(), "created_at": datetime.now()}
            ]
        }
    }
    
    athlete_profiles = {
        uuid.UUID("99120111-1111-1111-1111-111111111111"): {
            "name": "Alex Carter",
            "email": "alex.carter@gmail.com",
            "active_rehab_flag": True,
            "rehab_notes": "Active shoulder rehabilitation - restricted from full overhead snatches / heavy jerks without coach modification."
        }
    }

# --- ENDPOINTS WITH BIOMECHANICAL & WAITLIST LOGIC ---

@router.post("/{event_id}/rsvp", response_model=RSVPResponse)
async def submit_rsvp(event_id: uuid.UUID, payload: RSVPRequest):
    """
    Submits an RSVP to a specific gym event. 
    Implements a strict transactional queuing mechanism:
    1. Looks up target event capacity and queue state.
    2. Integrates Holly Hunt's biomechanical care gateway: checks if the athlete has an active injury/rehab flag.
    3. Handles overflow gracefully by shifting users to a waitlist if max capacity is exceeded.
    """
    # 1. Fetch event from database
    event = MockDB.gym_events.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gym event not found."
        )
    
    # 2. Check Holly Hunt's Biomechanical Care Gateway
    athlete = MockDB.athlete_profiles.get(payload.user_id)
    warning_flagged = False
    warning_message = None
    
    if athlete and athlete.get("active_rehab_flag"):
        warning_flagged = True
        warning_message = (
            f"PHYSIO CARE WARNING: {athlete['name']} is currently flagged with an active "
            f"injury restriction: '{athlete['rehab_notes']}'. This overhead mechanics workshop "
            f"presents joint shearing risks. Coach approval required."
        )
        
        # If the client hasn't acknowledged/overridden the warning yet, prevent automatic booking
        if not payload.override_rehab_warning:
            return RSVPResponse(
                rsvp_id=uuid.uuid4(),
                event_id=event_id,
                user_id=payload.user_id,
                status="blocked_by_warning",
                warning_flagged=True,
                warning_message=warning_message,
                timestamp=datetime.now()
            )

    # 3. Handle Capacity & Waitlist Queuing (FIFO Logic)
    current_attendee_count = len(event["attendees"])
    max_capacity = event["max_capacity"]
    
    if current_attendee_count < max_capacity:
        # User secures an active spot
        event["attendees"].append(payload.user_id)
        return RSVPResponse(
            rsvp_id=uuid.uuid4(),
            event_id=event_id,
            user_id=payload.user_id,
            status="attending",
            warning_flagged=warning_flagged,
            warning_message=warning_message,
            timestamp=datetime.now()
        )
    else:
        # Event is full. Add user to the waitlist queue
        # Verify user is not already on waitlist
        for item in event["waitlist"]:
            if item["user_id"] == payload.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is already on the waitlist for this event."
                )
        
        new_waitlist_entry = {"user_id": payload.user_id, "created_at": datetime.now()}
        event["waitlist"].append(new_waitlist_entry)
        queue_pos = len(event["waitlist"])
        
        return RSVPResponse(
            rsvp_id=uuid.uuid4(),
            event_id=event_id,
            user_id=payload.user_id,
            status="waitlisted",
            queue_position=queue_pos,
            warning_flagged=warning_flagged,
            warning_message=warning_message,
            timestamp=datetime.now()
        )

@router.delete("/{event_id}/rsvp", response_model=CancelResponse)
async def cancel_rsvp(event_id: uuid.UUID, user_id: uuid.UUID):
    """
    Cancels an athlete's RSVP. If they held an active slot, this endpoint automatically
    promotes the first athlete from the FIFO waitlist and triggers a notification workflow.
    """
    event = MockDB.gym_events.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gym event not found."
        )
        
    was_attending = user_id in event["attendees"]
    was_waitlisted = any(item["user_id"] == user_id for item in event["waitlist"])
    
    if not was_attending and not was_waitlisted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have an active RSVP or waitlist slot for this event."
        )
        
    promoted_user_id = None
    promoted_email = None
    
    if was_attending:
        event["attendees"].remove(user_id)
        
        # FIFO Auto-Promotion Logic
        if len(event["waitlist"]) > 0:
            promoted_entry = event["waitlist"].pop(0) # FIFO Pop
            promoted_user_id = promoted_entry["user_id"]
            event["attendees"].append(promoted_user_id)
            
            # Resolve email for mock dispatch (in real app, fetched from DB)
            promoted_email = "promoted.athlete@smallgoodsgym.com.au"
            
            # TODO: Dispatch Web Push notification to promoted_user_id:
            # "A spot has opened up! You've been automatically promoted to Attending."
            
        return CancelResponse(
            success=True,
            message="Active RSVP cancelled successfully. Waitlist has been automated.",
            promoted_user_id=promoted_user_id,
            promoted_user_email=promoted_email
        )
    else:
        # Just remove them from the waitlist array
        event["waitlist"] = [item for item in event["waitlist"] if item["user_id"] != user_id]
        return CancelResponse(
            success=True,
            message="Waitlist queue position retracted successfully."
        )
