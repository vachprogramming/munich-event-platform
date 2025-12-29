from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import User, UserCreate, UserRead, Event, Booking
from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=UserRead)
def signup(user: UserCreate, session: Session = Depends(get_session)):
    """
    Register a new user.
    """
    # 1. Check if email already exists
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password
    hashed_pwd = get_password_hash(user.password)
    
    # 3. Save to DB
    new_user = User(email=user.email, hashed_password=hashed_pwd)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    """
    Login endpoint. Returns a JWT token.
    OAuth2PasswordRequestForm automatically expects 'username' and 'password' fields.
    """
    # 1. Find user by email (form_data.username is the email here)
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    # 2. Verify password
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generate Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, # We put the email and role inside the token
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_my_profile(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile with their created events and bookings.
    """
    # Get events created by this user
    my_events = session.exec(
        select(Event).where(Event.owner_id == current_user.id)
    ).all()
    
    # Get bookings made by this user
    my_bookings = session.exec(
        select(Booking).where(Booking.user_id == current_user.id)
    ).all()
    
    # Get event details for each booking
    booked_events = []
    for booking in my_bookings:
        event = session.get(Event, booking.event_id)
        if event:
            booked_events.append({
                "booking_id": booking.id,
                "event_id": event.id,
                "title": event.title,
                "date": event.date.isoformat(),
                "location": event.location,
                "status": booking.status
            })
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role
        },
        "created_events": [
            {
                "id": e.id,
                "title": e.title,
                "date": e.date.isoformat(),
                "location": e.location,
                "available_tickets": e.available_tickets,
                "total_tickets": e.total_tickets
            } for e in my_events
        ],
        "booked_events": booked_events
    }