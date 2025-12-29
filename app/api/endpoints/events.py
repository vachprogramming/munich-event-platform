from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import Event, EventCreate, EventRead, User
from app.api.deps import get_current_user
from fastapi import HTTPException, status 
from sqlalchemy import func
from app.models import Booking

router = APIRouter()

@router.post("/events/", response_model=EventRead)
def create_event(
    event: EventCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # Login REQUIRED to create
):
    # Pass available_tickets during validation (not after, or Pydantic fails)
    db_event = Event.model_validate(event, update={
        "available_tickets": event.total_tickets,
        "owner_id": current_user.id
    })
    
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

@router.get("/events/{event_id}/analytics")
def get_event_analytics(
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Returns sales stats for an event. Only the Owner can see this.
    """
    # 1. Get Event & Check Ownership
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Count total bookings for this event
    total_sold = session.query(func.count(Booking.id))\
        .filter(Booking.event_id == event_id)\
        .scalar()
    
    revenue = total_sold * event.price
    
    # 3.Sales by Guest vs User
    # We count how many bookings have user_id (Users) vs None (Guests)
    guest_count = session.query(func.count(Booking.id))\
        .filter(Booking.event_id == event_id, Booking.user_id == None)\
        .scalar()
        
    user_count = total_sold - guest_count

    return {
        "event_title": event.title,
        "total_tickets": event.total_tickets,
        "sold": total_sold,
        "revenue": revenue,
        "guest_sales": guest_count,
        "user_sales": user_count
    }