# File: GuardianAI/database/connection.py
"""
Database connection manager for GuardianAI system.
Handles PostgreSQL connections with proper configuration and pooling.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
import logging

# Configure logging
logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections for the GuardianAI system."""
    
    def __init__(self):
        # Get database configuration from environment variables
        self.database_url = os.getenv(
            'DATABASE_URL', 
            'postgresql://user:password@localhost/guardianai'
        )
        
        # Create engine with connection pooling parameters
        self.engine = create_engine(
            self.database_url,
            pool_size=10,           # Number of connections to maintain
            max_overflow=20,        # Additional connections beyond pool size
            pool_pre_ping=True,     # Verify connections before use
            pool_recycle=3600,      # Recycle connections every hour
            echo=False              # Set to True for SQL logging (development only)
        )
        
        # Create session factory
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
    
    def get_db_session(self) -> Session:
        """Get a new database session."""
        return self.SessionLocal()
    
    @contextmanager
    def get_db_transaction(self) -> Generator[Session, None, None]:
        """
        Context manager for database transactions.
        
        Usage example:
            with db_manager.get_db_transaction() as session:
                # Perform database operations
                session.add(new_record)
                session.commit()
        """
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
    
    def create_tables(self):
        """Create all database tables."""
        from .models import Base, create_indexes
        
        # Create all tables
        Base.metadata.create_all(bind=self.engine)
        
        # Create additional indexes
        create_indexes(self.engine)
        logger.info("Database tables created successfully")
    
    def drop_tables(self):
        """Drop all database tables (use with caution!)."""
        from .models import Base
        
        Base.metadata.drop_all(bind=self.engine)
        logger.info("All database tables dropped")

# Global instance for use throughout the application
db_manager = DatabaseManager()

__all__ = ['db_manager', 'DatabaseManager']
