from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import db_helper
from app.core.schemas.schemas import ReadTask, CreateTask, DeleteTask
from app.crud import crud as tasks_crud

router = APIRouter(
    prefix="/api",
    tags=["todos"],
)


@router.get("", response_model=list[ReadTask])
async def get_all_tasks(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
):
    tasks = await tasks_crud.get_all_tasks(session=session)
    if tasks is None:
        return []
    return tasks


@router.post("", response_model=ReadTask)
async def create_task(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
    task_create: CreateTask,
):
    task = await tasks_crud.create_task(
        session=session,
        task_create=task_create,
    )
    return task


@router.delete("/{task_id}")
async def delete_task(
    session: Annotated[AsyncSession, Depends(db_helper.get_session)],
    task_id: int,
):
    task = await tasks_crud.delete_task(
        session=session,
        task_id_to_delete=task_id,
    )

    return task
