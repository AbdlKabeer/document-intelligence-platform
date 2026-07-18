import uuid
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from starlette.concurrency import run_in_threadpool
from sql_database import Base, engine
import datetime
from schemas import AccountType



class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    account_type = Column(Enum(AccountType))
    company_name = Column(String, nullable=True)
    employees_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    chats = relationship("Chat", back_populates="user")
    documents = relationship("Document", back_populates="user")

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    messages = Column(MutableList.as_mutable(JSON), default=list)  # Updated line
    
    # Relationships
    user = relationship("User", back_populates="chats")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    content = Column(String)
    is_global = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="documents")

# Create tables function
async def create_tables():
    await run_in_threadpool(Base.metadata.create_all, bind=engine)