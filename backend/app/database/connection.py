import logging
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from app.database.models import Base

logger = logging.getLogger(__name__)

# Create Async Engine and Session Pool
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def init_db(target_engine: AsyncEngine = engine) -> None:
    """Initialize database schemas (creates PostGIS extension and tables)"""
    try:
        async with target_engine.begin() as conn:
            # Enable postgis extension before creating tables
            from sqlalchemy import text
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # Note: If database connection is offline, we will fallback to runtime grids.

async def get_async_session() -> AsyncSession:
    """Dependency generator to acquire database session context"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
