from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import ToDo
from app.core.schemas.schemas import CreateTask


async def get_all_tasks(
    session: AsyncSession,
) -> Sequence[ToDo]:
    stmt = select(ToDo).order_by(ToDo.task_id)
    result = await session.execute(stmt)
    tasks = result.scalars().all()  # Fetch all rows as a list
    return tasks


async def create_task(
    session: AsyncSession,
    task_create: CreateTask,
):
    task = ToDo(**task_create.model_dump())
    session.add(task)
    await session.commit()
    return task
