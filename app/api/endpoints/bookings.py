from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import Booking, BookingCreate, BookingRead, User, Event
from app.api.deps import get_current_user
from app.core.redis_utils import acquire_lock

router = APIRouter()

@router.post("/bookings/", response_model=BookingRead)
def create_booking(
    booking_in: BookingCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Books a ticket for an event.
    Uses Redis Lock to prevent overselling.
    """
    # 1. We create a unique lock name for this specific event
    lock_key = f"lock:event:{booking_in.event_id}"
    
    # 2. Critical Section: Only one user enters here at a time!
    try:
        with acquire_lock(lock_key):
            # a. Get the event (fresh from DB)
            event = session.get(Event, booking_in.event_id)
            if not event:
                raise HTTPException(status_code=404, detail="Event not found")
            
            # b. Check availability
            if event.available_tickets <= 0:
                raise HTTPException(status_code=400, detail="Sold out!")
            
            # c. Decrement ticket count
            event.available_tickets -= 1
            session.add(event)
            
            # d. Create the booking record
            new_booking = Booking(
                user_id=current_user.id,
                event_id=event.id
            )
            session.add(new_booking)
            
            # e. Commit transaction
            session.commit()
            session.refresh(new_booking)
            
            return new_booking

    except HTTPException:
        # Re-raise HTTP exceptions (like 404, 400) as-is
        raise
    except Exception as e:
        # Only catch lock-related errors and return 503
        raise HTTPException(status_code=503, detail="Server busy, please try again")