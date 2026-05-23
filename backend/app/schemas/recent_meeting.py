from datetime import datetime
from pydantic import BaseModel, ConfigDict

# Base schema containing shared attributes
class RecentMeetingBase(BaseModel):
    meeting_id: str
    participant_name: str

# Schema for creating a recent meeting entry (inputs)
class RecentMeetingCreate(RecentMeetingBase):
    pass

# Schema for returning a recent meeting entry (outputs)
class RecentMeetingResponse(RecentMeetingBase):
    id: int
    joined_at: datetime

    # Enable ORM compatibility for automatic conversion from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)
