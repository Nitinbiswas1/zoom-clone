import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define database URL. We resolve the absolute path to zoom_clone.db
# in the backend directory so that the path is reliable regardless of where main.py is run.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_PATH = os.path.join(BASE_DIR, "zoom_clone.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Create engine for SQLite
# check_same_thread=False is required only for SQLite to allow multiple threads to access it.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative Base for ORM models
Base = declarative_base()

# Dependency function to yield database session in FastAPI path operations
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
