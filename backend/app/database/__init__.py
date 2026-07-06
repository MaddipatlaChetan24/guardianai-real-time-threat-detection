# backend/app/database/__init__.py
"""Database package for GuardianAI Backend."""

from .connection import db_manager

async def init_db():
    """Initialize the database (create tables if needed)."""
    import logging
    logger = logging.getLogger(__name__)
    try:
        if db_manager.verify_connection():
            logger.info("Database connection established successfully")
        else:
            logger.warning("Database connection could not be verified")
    except Exception as e:
        logger.warning(f"Database connection failed (may be expected in dev): {e}")

def get_db_session():
    """Get a database session (generator for FastAPI dependency injection)."""
    yield from db_manager.get_db_dependency()

__all__ = ["db_manager", "init_db", "get_db_session"]
