from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.recent_meeting import RecentMeeting
from app.schemas.recent_meeting import RecentMeetingCreate, RecentMeetingResponse

router = APIRouter(
    prefix="/recent",
    tags=["recent"]
)

@router.post("", response_model=RecentMeetingResponse, status_code=status.HTTP_201_CREATED)
def record_recent_meeting(recent_in: RecentMeetingCreate, db: Session = Depends(get_db)):
    """
    Saves a log of a participant joining a meeting to the database,
    recording their participant_name and the corresponding meeting_id.
    """
    db_recent = RecentMeeting(
        meeting_id=recent_in.meeting_id,
        participant_name=recent_in.participant_name
    )
    db.add(db_recent)
    db.commit()
    db.refresh(db_recent)
    return db_recent

@router.get("", response_model=List[RecentMeetingResponse])
def get_recent_meetings(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns a list of recently joined meetings, ordered by joined_at descending
    to populate the "Recent Meetings" section on the landing dashboard.
    """
    return (
        db.query(RecentMeeting)
        .order_by(RecentMeeting.joined_at.desc())
        .limit(limit)
        .all()
    )
