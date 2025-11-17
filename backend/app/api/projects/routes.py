from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.session import get_db
from app.models import Project, User
from app.schemas import (
    ProjectCreateIn,
    ProjectUpdateIn,
    ProjectOut,
    PaginatedProjects,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])

# --------------------------------------------------------------------------
# 📜 List all projects for the current user
# --------------------------------------------------------------------------
@router.get("/", response_model=PaginatedProjects)
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    projects = (
        db.query(Project)
        .filter(Project.user_id == user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return {"items": projects, "total": len(projects)}

# --------------------------------------------------------------------------
# ➕ Create new project
# --------------------------------------------------------------------------
@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Check if project with this ID already exists for this user
    existing = db.query(Project).filter(
        Project.id == payload.id, Project.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project with this ID already exists",
        )
    
    project = Project(
        id=payload.id,
        user_id=user.id,
        name=payload.name,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# --------------------------------------------------------------------------
# 📝 Update project name
# --------------------------------------------------------------------------
@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    payload: ProjectUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.name = payload.name
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project

# --------------------------------------------------------------------------
# ❌ Delete project
# --------------------------------------------------------------------------
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
