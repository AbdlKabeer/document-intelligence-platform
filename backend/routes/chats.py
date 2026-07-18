# chats.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sql_database import get_db
from models import Chat
import datetime
import uuid
from schemas import ChatCreate, ChatResponse, MessageCreate
from routes.auth import get_current_user
from config import logger

router = APIRouter()

@router.post("/chats", response_model=ChatResponse)
async def create_chat(
    request: ChatCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = Chat(
        title=request.title,
        user_id=current_user.id,
        uuid=str(uuid.uuid4())
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.post("/chats/{chat_uuid}/messages")
async def add_message(
    chat_uuid: str,
    message: MessageCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(
        Chat.uuid == chat_uuid,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Initialize messages if None
    if chat.messages is None:
        chat.messages = []
    
    # Convert message to dict for JSON storage
    message_dict = {
        "type": message.type,
        "content": message.content,
        "content_type": message.content_type,
        "timestamp": message.timestamp.isoformat() if message.timestamp else datetime.datetime.utcnow().isoformat()
    }
    
    # Append new message
    current_messages = chat.messages or []
    current_messages.append(message_dict)
    chat.messages = current_messages  # Reassign to trigger SQLAlchemy change detection
    
    try:
        db.add(chat)
        db.commit()

        return {"status": "success", "message": message_dict}
    except Exception as e:
        db.rollback()
        logger.error("Rollback due to:", e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/chats", response_model=List[ChatResponse])
async def get_user_chats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Query to get all chats for the current user
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
    
    return chats

@router.get("/chats/{chat_uuid}")
async def get_chat(
    chat_uuid: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(
        Chat.uuid == chat_uuid,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    return chat

@router.delete("/chats/{chat_uuid}", status_code=204)
async def delete_chat(
    chat_uuid: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the chat based on the UUID and the current user's ID
    chat = db.query(Chat).filter(
        Chat.uuid == chat_uuid,
        Chat.user_id == current_user.id
    ).first()
    
    # If the chat is not found, raise a 404 error
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete the chat
    db.delete(chat)
    db.commit()  # Commit the transaction to the database
    
    # Return a successful response with no content
    return
