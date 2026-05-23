from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.connection import Base

class RecentMeeting(Base):
    __tablename__ = "recent_meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String, index=True, nullable=False)
    participant_name = Column(String, nullable=False)
    joined_at = Column(DateTime, server_default=func.now(), nullable=False)
