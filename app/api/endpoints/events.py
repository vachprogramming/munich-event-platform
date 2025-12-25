from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import Event, EventCreate, EventRead, User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/events/", response_model=EventRead)
def create_event(
    event: EventCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # <--- The Bouncer!
):
    """
    Create a new event. Requires authentication.
    """
    db_event = Event.model_validate(event, update={"available_tickets": event.total_tickets})
    
    # Optional: We could save who created the event!
    # db_event.owner_id = current_user.id 
    
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event

@router.get("/events/", response_model=List[EventRead])
def read_events(session: Session = Depends(get_session)):
    """
    Get all events.
    """
    events = session.exec(select(Event)).all()
    return events