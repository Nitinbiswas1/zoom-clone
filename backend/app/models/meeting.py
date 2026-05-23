from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, func
from app.database.connection import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in minutes
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    is_instant = Column(Boolean, default=False, nullable=False)
