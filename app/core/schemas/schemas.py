from pydantic import BaseModel
from typing import Optional


class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class CreateTask(TaskBase):
    pass


class DeleteTask(BaseModel):
    message: str


class UpdateTask(TaskBase):
    # task_id: int
    pass


class ReadTask(TaskBase):
    task_id: int

    class Config:
        from_attributes = True
