# documents.py
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from sql_database import get_db
from models import Document
from fastapi.responses import JSONResponse
from elasticsearch_database import es_client, get_user_documents, delete_user_document
from config import logger, UPLOAD_FOLDER
from typing import List
from schemas import DocumentResponse

router = APIRouter()

@router.get("/documents/", response_model=List[DocumentResponse])
async def list_documents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all documents belonging to the current user."""
    try:
        # Get documents from Elasticsearch for the current user
        documents = await get_user_documents(current_user.id, skip, limit)
        
        # Convert Elasticsearch results to response format
        return [
            DocumentResponse(
                id=hit["_source"]["document_id"],
                filename=hit["_source"]["id"],
                created_at=hit["_source"]["created_at"]
            ) for hit in documents
        ]
    
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while listing documents.")

@router.delete("/documents/{document_id}/")
async def delete_document(
    document_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document from both Elasticsearch and SQL database."""
    try:
        # First check if the document exists and belongs to the user in SQL database
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found or access denied.")

        # Delete from Elasticsearch
        deleted = await delete_user_document(document_id, current_user.id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found in search index.")

        # Delete the file from filesystem
        file_path = os.path.join(UPLOAD_FOLDER, document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File '{file_path}' deleted successfully.")

        # Delete from SQL database
        db.delete(document)
        db.commit()

        return {"message": f"Document '{document.filename}' deleted successfully."}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error deleting document ID '{document_id}': {e}")
        raise HTTPException(status_code=500, detail="An error occurred while deleting the document.")
