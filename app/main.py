from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import create_db_and_tables
from app.core.config import settings

# 1. Lifespan Events
# This runs code BEFORE the app starts receiving requests.
# We use it to create the database tables automatically.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup: Creating database tables...")
    create_db_and_tables()
    yield
    print("Shutdown: Cleaning up...")

# 2. Initialize the App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# 3. The "Health Check" Endpoint
@app.get("/")
def read_root():
    return {"message": "Servus! The Munich Event API is running 🍺"}

@app.get("/health")
def health_check():
    return {"status": "ok", "db": "connected"}