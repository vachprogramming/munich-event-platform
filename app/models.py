from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class EventBase(SQLModel):
    title: str = Field(index=True)  
    description: str
    location: str
    date: datetime
    total_tickets: int
    price: float = 0.0

# table=True tells SQLModel: "Make a real table in the database for this"
class Event(EventBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    available_tickets: int 
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Pydantic Schema for CREATING an event (User input)
class EventCreate(EventBase):
    pass

# Pydantic Schema for READING an event (API Output)
class EventRead(EventBase):
    id: int
    available_tickets: int
