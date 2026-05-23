from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

# Base schema containing shared attributes
class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    created_by: str
    scheduled_time: Optional[datetime] = None
    duration: Optional[int] = None  # Duration in minutes
    is_instant: bool = False

# Schema for creating a meeting (inputs)
class MeetingCreate(MeetingBase):
    pass

# Schema for returning a meeting (outputs)
class MeetingResponse(MeetingBase):
    id: int
    meeting_id: str
    created_at: datetime

    # Enable ORM compatibility for automatic conversion from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)
