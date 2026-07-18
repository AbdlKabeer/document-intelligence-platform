from fastapi import APIRouter
from elasticsearch_database import es_client, create_index
from fastapi import HTTPException
from config import ELASTICSEARCH_INDEX

router = APIRouter()

@router.post("/reset-index/")
async def reset_index():
    try:
        if await es_client.indices.exists(index=ELASTICSEARCH_INDEX):
            await es_client.indices.delete(index=ELASTICSEARCH_INDEX)
            await create_index()  # Recreate the index with new mapping
            return {"message": "Index successfully reset"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting index: {str(e)}")
    