import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import redis.asyncio as aioredis
from qdrant_client import QdrantClient

# Load Environment Variables or defaults
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres_secure_pass@localhost:5432/hcho_db")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "redis_secure_pass")
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# ==============================================================================
# 1. POSTGRESQL + POSTGIS CONNECTION
# ==============================================================================
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an asynchronous transactional database context."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ==============================================================================
# 2. REDIS CONNECTION POOL
# ==============================================================================
redis_pool = aioredis.ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True,
    max_connections=50,
)

def get_redis_client() -> aioredis.Redis:
    """Get an asynchronous Redis client instance."""
    return aioredis.Redis(connection_pool=redis_pool)


# ==============================================================================
# 3. QDRANT VECTOR DB CONNECTION
# ==============================================================================
def get_qdrant_client() -> QdrantClient:
    """Get a Qdrant client instance."""
    if QDRANT_API_KEY:
        return QdrantClient(
            url=f"http://{QDRANT_HOST}:{QDRANT_PORT}",
            api_key=QDRANT_API_KEY,
        )
    return QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
