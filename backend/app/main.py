from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database engine and declarative Base
from app.database.connection import engine, Base

# Import all SQLAlchemy models to register them with metadata before create_all
from app.models.meeting import Meeting
from app.models.recent_meeting import RecentMeeting

# Import routers
from app.routes.meetings import router as meetings_router
from app.routes.recent import router as recent_router

# Create SQLite database tables automatically
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Zoom Clone API",
    description="Backend API for Zoom Web Clone supporting instant/scheduled meetings and participant history",
    version="1.0.0"
)

# Configure CORS Middleware
# Next.js applications typically run on localhost:3000, but we allow wildcard for Vercel deployment
import os

frontend_url = os.getenv("FRONTEND_URL", "*")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_url != "*" and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if frontend_url == "*" else origins,
    allow_credentials=frontend_url != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings_router)
app.include_router(recent_router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Zoom Clone API Server",
        "documentation": "/docs"
    }
