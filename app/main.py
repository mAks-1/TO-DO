from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app.core.models.db_helper import db_helper
from .core.config import settings

from .api import router as api_router

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown
    await db_helper.dispose()


app = FastAPI(
    lifespan=lifespan,
)
app.include_router(
    api_router,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Замініть * на конкретний домен, якщо потрібно
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello "}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.run.host,
        port=settings.run.port,
        reload=True,
    )
