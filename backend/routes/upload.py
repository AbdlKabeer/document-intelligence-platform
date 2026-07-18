from fastapi import APIRouter, HTTPException, File, UploadFile, Depends
from routes.auth import get_current_user
from sql_database import get_db
from fastapi.responses import JSONResponse
from config import FILE_SIZE_LIMIT, UPLOAD_FOLDER, logger
from sqlalchemy.orm import Session
from encryption import encrypt_file
from file_processing import extract_text_from_pdf, extract_text_from_xlsx, extract_text_from_docx, extract_text_from_txt, extract_text_from_image, extract_text_from_pptx
from elasticsearch_database import add_document_to_elasticsearch, model
from models import Document
import os

router = APIRouter()

@router.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload, process, and then encrypt files with enhanced table handling."""
    # Ensure the file size is reasonable
    #FILE_SIZE_LIMIT = int(os.getenv("FILE_SIZE_LIMIT", 10 * 1024 * 1024))  # Default to 10 MB
    if file.size > FILE_SIZE_LIMIT:
        raise HTTPException(status_code=400, detail=f"File size exceeds the {FILE_SIZE_LIMIT / (1024 * 1024)} MB limit.")
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    try:
        # Read the uploaded file content
        file_content = await file.read()  # Read file content for processing

        # Create document record in SQL database
        document = Document(
            filename=file.filename,
            user_id=current_user.id,
            is_global=False  # Set based to false by default
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Extract text and tables based on file type
        text = ""
        tables = []

        if file.filename.endswith(".pdf"):
            text, tables = extract_text_from_pdf(file_content)
        elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            text, tables = extract_text_from_image(file_content)
        elif file.filename.endswith(".txt"):
            text, tables = extract_text_from_txt(file_content)
        elif file.filename.endswith(".docx"):
            text, tables = extract_text_from_docx(file_content)
        elif file.filename.endswith(".xlsx"):
            text, tables = extract_text_from_xlsx(file_content)
        elif file.filename.endswith('.pptx'):
            text, tables = extract_text_from_pptx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        # Generate semantic embedding
        embedding = model.encode(text).tolist()

        # Store extracted text and tables in Elasticsearch
        #await add_document_to_elasticsearch(file.filename, text, tables, embedding)
        # Store in Elasticsearch with user association
        await add_document_to_elasticsearch(
            filename=file.filename,
            content=text,
            tables=tables,
            embedding=embedding,
            user_id=current_user.id,
            document_id=document.id
        )

        # Save the uploaded file content to the filesystem
        with open(file_path, "wb") as f:
            f.write(file_content)  # Save the unencrypted content

        # Encrypt the file for storage
        encrypt_file(file_path)  # Encrypt the saved file

        return JSONResponse(content={
            "message": f"File '{file.filename}' uploaded, processed, and encrypted successfully.",
            "document_id": document.id,
            "tables_found": len(tables)
        })

    except Exception as e:
        db.rollback()  # Rollback SQL transaction on error
        logger.error(f"Error processing file '{file.filename}': {e}")
        raise HTTPException(status_code=500, detail="Error processing the file.")
