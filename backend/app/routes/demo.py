from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.security.dependencies import get_current_user, get_optional_user
from backend.app.services.demo_service import execute_demo_pipeline

router = APIRouter(prefix="/api/demo", tags=["Demo Pipeline"])

@router.post("/run")
def run_demo(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Executes full end-to-end academic demo workflow."""
    try:
        result = execute_demo_pipeline(current_user, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo execution failed: {str(e)}")
