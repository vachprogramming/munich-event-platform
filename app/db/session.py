from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# 1. Create the engine
# check_same_thread=False is ONLY needed for SQLite. 
# Postgres doesn't need it.
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

# 2. Dependency Injection function
# This gives a fresh database session to every API request
# and closes it automatically when the request is done.
def get_session():
    with Session(engine) as session:
        yield session

# 3. Startup function
# This looks at your code and creates tables in the DB if they don't exist.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)