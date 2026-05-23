from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.connection import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingResponse
from app.utils.generate_meeting_id import generate_meeting_id

router = APIRouter(
    prefix="/meetings",
    tags=["meetings"]
)

# Custom schema for instant meetings to make title and created_by optional
class InstantMeetingCreate(BaseModel):
    title: Optional[str] = "Instant Meeting"
    created_by: str = "Default User"

@router.post("/instant", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_instant_meeting(meeting_in: InstantMeetingCreate, db: Session = Depends(get_db)):
    """
    Creates an instant meeting, automatically generating a unique meeting ID,
    setting is_instant to True, and saving the record to the database.
    """
    meeting_id = generate_meeting_id()
    
    db_meeting = Meeting(
        meeting_id=meeting_id,
        title=meeting_in.title,
        created_by=meeting_in.created_by,
        is_instant=True
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.post("/schedule", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_scheduled_meeting(meeting_in: MeetingCreate, db: Session = Depends(get_db)):
    """
    Creates and schedules a meeting with description, start time, and duration,
    generating a unique meeting ID and storing the record in the database.
    """
    meeting_id = generate_meeting_id()
    
    db_meeting = Meeting(
        meeting_id=meeting_id,
        title=meeting_in.title,
        description=meeting_in.description,
        created_by=meeting_in.created_by,
        scheduled_time=meeting_in.scheduled_time,
        duration=meeting_in.duration,
        is_instant=False  # Explicitly set to false since this is scheduled
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/upcoming", response_model=List[MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    """
    Returns all scheduled (non-instant) meetings that start in the future,
    ordered by their scheduled start time ascending.
    """
    now = datetime.utcnow()
    meetings = (
        db.query(Meeting)
        .filter(Meeting.is_instant == False)
        .filter(Meeting.scheduled_time >= now)
        .order_by(Meeting.scheduled_time.asc())
        .all()
    )
    return meetings

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """
    Validates that a meeting exists given its Zoom-style meeting ID (e.g., 123-456-7890).
    If found, returns the meeting information. Otherwise, returns a 404 error.
    """
    meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    return meeting
