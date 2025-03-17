from typing import Sequence

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import ToDo
from app.core.schemas.schemas import CreateTask, DeleteTask, ReadTask, UpdateTask


async def get_all_tasks(
    session: AsyncSession,
) -> Sequence[ToDo]:
    stmt = select(ToDo).order_by(ToDo.task_id)
    result = await session.execute(stmt)
    tasks = result.scalars().all()

    return tasks


async def create_task(
    session: AsyncSession,
    task_create: CreateTask,
):
    task = ToDo(**task_create.model_dump())
    session.add(task)
    await session.commit()
    return task


async def delete_task(
    session: AsyncSession,
    task_id_to_delete: int,
):
    result = await session.execute(
        select(ToDo).filter(ToDo.task_id == task_id_to_delete)
    )
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()
    return {"message": "Task deleted successfully"}


async def update_task(
    session: AsyncSession,
    task_update: UpdateTask,
    task_id_to_update: int,
):
    result = await session.execute(
        select(ToDo).filter(ToDo.task_id == task_id_to_update)
    )
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title:
        task.title = task_update.title
    if task_update.description:
        task.description = task_update.description
    if task_update.completed is not None:
        task.completed = task_update.completed

    await session.commit()
    await session.refresh(task)

    return task
