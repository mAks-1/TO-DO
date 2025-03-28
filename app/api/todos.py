from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import ToDo
from app.core.models.db_helper import db_helper
from app.core.schemas.schemas import ReadTask, CreateTask, DeleteTask, UpdateTask
from app.crud import crud as tasks_crud

router = APIRouter(
    prefix="/api/todos",
    tags=["todos"],
)


@router.get("", response_model=list[ReadTask])
async def get_all_tasks(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
):
    tasks = await tasks_crud.get_all_tasks(session=session)
    return tasks if tasks else []


@router.post("", response_model=ReadTask)
async def create_task(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
    task_create: CreateTask,
):
    return await tasks_crud.create_task(session=session, task_create=task_create)


@router.delete("/{task_id}", response_model=DeleteTask)
async def delete_task(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
    task_id: int,
):
    task = await tasks_crud.delete_task(session=session, task_id_to_delete=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=ReadTask)
async def update_task(
    task_id: int,
    task_update: UpdateTask,
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
):
    result = await session.execute(select(ToDo).filter(ToDo.task_id == task_id))
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.completed is not None:
        task.completed = task_update.completed

    await session.commit()
    await session.refresh(task)

    return task
