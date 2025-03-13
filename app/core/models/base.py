from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class ToDoBase(DeclarativeBase):
    __abstract__ = True
    __tablename__ = "todo_items"

    task_id: Mapped[int] = mapped_column(primary_key=True)