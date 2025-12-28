from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import Event, EventCreate, EventRead, User
from app.api.deps import get_current_user
from fastapi import HTTPException, status 

router = APIRouter()

@router.post("/events/", response_model=EventRead)
def create_event(
    event: EventCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # Login REQUIRED to create
):
    db_event = Event.model_validate(event)
    db_event.available_tickets = event.total_tickets
    db_event.owner_id = current_user.id # Stamp ownership
    
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

@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an event. Only the Owner can do this.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # CHECK OWNERSHIP
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    session.delete(event)
    session.commit()
    return {"ok": True}    