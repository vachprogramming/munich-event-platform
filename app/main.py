from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import create_db_and_tables
from app.core.config import settings
from app.api.endpoints import events, auth, bookings

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.include_router(events.router, tags=["Events"]) 
app.include_router(auth.router, tags=["Auth"])
app.include_router(bookings.router, tags=["Bookings"])

@app.get("/")
def read_root():
    return {"message": "Servus! The Munich Event API is running 🍺"}

@app.get("/health")
def health_check():
    return {"status": "ok"}