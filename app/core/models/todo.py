from sqlalchemy.orm import Mapped, mapped_column

from .base import ToDoBase


class ToDo(ToDoBase):
    title: Mapped[str]
    description: Mapped[str]
    completed: Mapped[bool] = False
