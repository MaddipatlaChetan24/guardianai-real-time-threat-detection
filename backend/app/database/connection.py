# File: backend/app/database/connection.py
"""
Database connection manager for GuardianAI Backend.
Uses SQLite for development, PostgreSQL for production.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
import logging

logger = logging.getLogger(__name__)


def _build_db_url() -> str:
    """Build database URL from environment, defaulting to SQLite for dev."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    # Use SQLite for local development (no server needed)
    db_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "guardianai_dev.db")
    return f"sqlite:///{os.path.abspath(db_path)}"


class DatabaseManager:
    """Manages database connections for the GuardianAI system."""

    def __init__(self):
        self.database_url = _build_db_url()
        is_sqlite = self.database_url.startswith("sqlite")

        engine_kwargs = {
            "pool_pre_ping": True,
            "echo": False,
        }

        if not is_sqlite:
            engine_kwargs.update({
                "pool_size": 10,
                "max_overflow": 20,
                "pool_recycle": 3600,
            })
        else:
            # SQLite requires connect_args for thread safety
            engine_kwargs["connect_args"] = {"check_same_thread": False}

        self.engine = create_engine(self.database_url, **engine_kwargs)

        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )
        logger.info(f"Database configured: {self.database_url.split('?')[0]}")

    def get_db_session(self) -> Session:
        """Get a new database session."""
        return self.SessionLocal()

    @contextmanager
    def get_db_transaction(self) -> Generator[Session, None, None]:
        """Context manager for database transactions."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            logger.error(f"Database transaction failed: {e}")
            session.rollback()
            raise
        finally:
            session.close()

    def get_db_dependency(self):
        """FastAPI dependency injection for database session."""
        db = self.get_db_session()
        try:
            yield db
        finally:
            db.close()

    def verify_connection(self) -> bool:
        """Test that the database is reachable."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.warning(f"Database connection test failed: {e}")
            return False


# Global singleton
db_manager = DatabaseManager()

__all__ = ["db_manager"]
