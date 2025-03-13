from pydantic import BaseModel

class Task(BaseModel):
    title: str
    description: str
    completed: bool = False


class CreateTask(Task):
    pass


class deleteTask(Task):
    task_id: int


class UpdateTask(deleteTask):
    pass