from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import Booking, BookingCreate, BookingRead, User, Event
from app.api.deps import get_current_user
from app.core.redis_utils import acquire_lock
import requests

router = APIRouter()

@router.post("/bookings/", response_model=BookingRead)
def create_booking(
    booking_in: BookingCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    lock_key = f"lock:event:{booking_in.event_id}"
    
    try:
        with acquire_lock(lock_key):

            event = session.get(Event, booking_in.event_id)
            if not event:
                raise HTTPException(status_code=404, detail=f"Event with id {booking_in.event_id} not found")
            if event.available_tickets <= 0:
                raise HTTPException(status_code=400, detail="Sold out!")

            # In Docker, we use the service name "payment-service" as the hostname
            payment_url = "http://payment-service:8080/payments/process"
            payment_payload = {"amount": float(event.price), "user_email": current_user.email}
            
            try:
                # 5-second timeout so we don't hang forever
                headers = {"Content-Type": "application/json"}
                print(f"Sending payment request: {payment_payload}")
                response = requests.post(payment_url, json=payment_payload, headers=headers, timeout=5)
                print(f"Payment response: status={response.status_code}, body={response.text}")
                response.raise_for_status() # Raise error if status is not 200
            except requests.exceptions.HTTPError as e:
                print(f"Payment service HTTPError: {e}, response body: {e.response.text if e.response else 'No response'}")
                raise HTTPException(status_code=503, detail=f"Payment failed: {e.response.text if e.response else str(e)}")
            except Exception as e:
                print(f"Payment service error: {type(e).__name__}: {e}")
                raise HTTPException(status_code=503, detail=f"Payment failed: {type(e).__name__}: {str(e)}")
            # --------------------------------------

            # If payment succeeded, proceed to save to DB
            event.available_tickets -= 1
            session.add(event)
            
            new_booking = Booking(
                user_id=current_user.id,
                event_id=event.id,
                status="paid" # We can now mark it as paid
            )
            session.add(new_booking)
            session.commit()
            session.refresh(new_booking)
            return new_booking

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"Booking error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=503, detail=f"Server busy: {type(e).__name__}: {str(e)}")