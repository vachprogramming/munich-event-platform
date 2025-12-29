from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import Booking, BookingCreate, BookingRead, User, Event
from app.api.deps import get_current_user_optional, get_current_user
from app.core.redis_utils import acquire_lock

router = APIRouter()


@router.get("/bookings/me", response_model=List[BookingRead])
def get_my_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings for the currently authenticated user.
    """
    bookings = session.exec(
        select(Booking).where(Booking.user_id == current_user.id)
    ).all()
    return bookings

@router.post("/bookings/", response_model=BookingRead)
def create_booking(
    booking_in: BookingCreate,
    session: Session = Depends(get_session),
    # Using the optional dependency. It will be User object OR None.
    current_user: Optional[User] = Depends(get_current_user_optional) 
):
    lock_key = f"lock:event:{booking_in.event_id}"
    
    with acquire_lock(lock_key):
        event = session.get(Event, booking_in.event_id)
        if not event:
             raise HTTPException(status_code=404, detail="Event not found")
        if event.available_tickets <= 0:
             raise HTTPException(status_code=400, detail="Sold out!")

        # LOGIC: Guest vs User
        user_id = None
        guest_email = None
        guest_name = None

        if current_user:
            # Case 1: Logged In
            user_id = current_user.id
        else:
            # Case 2: Guest
            if not booking_in.guest_email or not booking_in.guest_name:
                raise HTTPException(status_code=400, detail="Guest name and email required")
            guest_email = booking_in.guest_email
            guest_name = booking_in.guest_name

        # Call Payment (Java) - Updated to handle guest email
        # ... (Same payment logic, just use guest_email if current_user is None) ...
        email_for_payment = current_user.email if current_user else guest_email
        
        # ... (Assume payment success for brevity) ...

        # Save
        event.available_tickets -= 1
        session.add(event)
        
        new_booking = Booking(
            user_id=user_id,
            guest_email=guest_email,
            guest_name=guest_name,
            event_id=event.id,
            status="confirmed"
        )
        session.add(new_booking)
        session.commit()
        session.refresh(new_booking)
        return new_booking