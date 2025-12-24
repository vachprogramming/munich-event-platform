from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import Event, EventCreate, EventRead

router = APIRouter()

@router.post("/events/", response_model=EventRead)
def create_event(event: EventCreate, session: Session = Depends(get_session)):
    """
    Create a new event. 
    Initial available_tickets will equal total_tickets.
    """
    # 1. Convert the "Create" model to the "Table" model
    db_event = Event.model_validate(event)
    
    # 2. Set logic: initially, all tickets are available
    db_event.available_tickets = event.total_tickets
    
    # 3. Add to DB and save
    session.add(db_event)
    session.commit()
    session.refresh(db_event) # Refresh to get the generated ID
    return db_event

@router.get("/events/", response_model=List[EventRead])
def read_events(session: Session = Depends(get_session)):
    """
    Get all events.
    """
    events = session.exec(select(Event)).all()
    return events