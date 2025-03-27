from pydantic import BaseModel


class TaskBase(BaseModel):
    title: str
    description: str
    completed: bool = False


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
