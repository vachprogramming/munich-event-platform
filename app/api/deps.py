from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel import Session

from app.core.config import settings
from app.db.session import get_session
from app.models import User

#telling FastAPI: "Look for the token in the Authorization: Bearer <token> header"
# The tokenUrl="token" part tells Swagger UI where to send the username/password to get a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(
    session: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validates the token and returns the current user object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub") # We stored the email in the "sub" field
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # 2. Checking if user exists in DB
    user = session.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user