from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import UserCreate, UserLogin, UserOut, Token, PasswordReset
from backend.app.security.auth import hash_password, verify_password, create_access_token
from backend.app.security.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if user_in.password != user_in.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    clean_full_name = user_in.full_name.strip()
    clean_username = user_in.username.strip()
    clean_email = user_in.email.strip().lower()

    if len(clean_full_name) < 2:
        raise HTTPException(status_code=400, detail="Full name must be at least 2 characters")
    if len(clean_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    # Check duplicate username case-insensitively
    if db.query(User).filter(User.username.ilike(clean_username)).first():
        raise HTTPException(status_code=400, detail="Username is already taken")

    # Check duplicate email case-insensitively
    if db.query(User).filter(User.email.ilike(clean_email)).first():
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        full_name=clean_full_name,
        username=clean_username,
        email=clean_email,
        password_hash=hash_password(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    identifier = login_in.username_or_email.strip()
    user = db.query(User).filter(
        (User.username.ilike(identifier)) | (User.email.ilike(identifier))
    ).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    access_token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/reset-password")
def reset_password(reset_in: PasswordReset, db: Session = Depends(get_db)):
    identifier = reset_in.email_or_username.strip()
    user = db.query(User).filter(
        (User.username.ilike(identifier)) | (User.email.ilike(identifier))
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = hash_password(reset_in.new_password)
    db.commit()
    return {"message": "Password successfully reset. Please log in with your new password."}
