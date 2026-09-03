from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.security.auth import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Returns the current user if a valid token is provided, or a default demo user if not."""
    if token:
        payload = decode_token(token)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == int(payload["sub"])).first()
            if user:
                return user
    
    # Fallback to demo/first user or create one
    demo_user = db.query(User).filter(User.username == "researcher").first()
    if not demo_user:
        from backend.app.security.auth import hash_password
        demo_user = User(
            full_name="Academic Researcher",
            username="researcher",
            email="researcher@lab.edu",
            password_hash=hash_password("DemoPassword123!")
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user
