from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

# --- USER MODEL ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = "user"

class UserCreate(SQLModel):
    email: str
    password: str

class UserRead(SQLModel):
    id: int
    email: str
    role: str

# --- EVENT MODEL  ---
class EventBase(SQLModel):
    title: str = Field(index=True)
    description: str
    location: str
    date: datetime
    total_tickets: int
    price: float = 0.0

class Event(EventBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    available_tickets: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Linking event to the user who created it
    # We use Optional because old events in DB might not have an owner
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    id: int
    available_tickets: int
    owner_id: Optional[int] # Return this so frontend knows if "Delete" button should show

# --- BOOKING MODEL  ---
class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # CHANGED: user_id is now Optional (for guests)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    event_id: int = Field(foreign_key="event.id")
    
    # NEW: Guest details (only used if user_id is None)
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(SQLModel):
    event_id: int
    # Guest fields are optional in the input
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None

class BookingRead(SQLModel):
    id: int
    event_id: int
    status: str
    # We return these so the user sees their name on the ticket
    guest_name: Optional[str]
    user_id: Optional[int]