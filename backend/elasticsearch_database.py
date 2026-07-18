import datetime
from typing import List
from schemas import Table
from config import logger, ELASTICSEARCH_URL, ELASTICSEARCH_INDEX, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD
from elasticsearch import AsyncElasticsearch
from sentence_transformers import SentenceTransformer

# Initialize Elasticsearch client
es_client = AsyncElasticsearch(
    hosts=[ELASTICSEARCH_URL],
    timeout=1000,
    basic_auth=(ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD),
    verify_certs=False
)

model = SentenceTransformer('all-MiniLM-L6-v2')

async def create_index():
    """Create Elasticsearch index if it does not exist."""
    try:
        # Check if the index already exists
        if not await es_client.indices.exists(index=ELASTICSEARCH_INDEX):
            # Create the index with the updated mapping
            await es_client.indices.create(index=ELASTICSEARCH_INDEX, body={
                "mappings": {
                    "properties": {
                        "id": {"type": "keyword"},  # For filename/document identifier
                        "content": {"type": "text"},  # For document content
                        "embedding": {
                            "type": "dense_vector", 
                            "dims": 384  # Dimension for all-MiniLM-L6-v2
                        },
                        "tables": {  # Nested type for tables
                            "type": "nested",
                            "properties": {
                                "name": {"type": "keyword"},
                                "content": {"type": "text"},
                                "description": {"type": "text"}
                            }
                        },
                        "user_id": {"type": "keyword"},  # Added for user-specific documents
                        "document_id": {"type": "keyword"},  # Added to link with SQL database
                        "created_at": {"type": "date"}  # Added for tracking document creation time
                    }
                },
                "settings": {
                    "index": {
                        "number_of_shards": 1,
                        "number_of_replicas": 1
                    }
                }
            })
            logger.info(f"Index '{ELASTICSEARCH_INDEX}' created successfully!")
        else:
            # Update existing index mapping to include new fields
            try:
                await es_client.indices.put_mapping(
                    index=ELASTICSEARCH_INDEX,
                    body={
                        "properties": {
                            "user_id": {"type": "keyword"},
                            "document_id": {"type": "keyword"},
                            "created_at": {"type": "date"}
                        }
                    }
                )
                logger.info(f"Index '{ELASTICSEARCH_INDEX}' mapping updated successfully!")
            except Exception as e:
                logger.error(f"Error updating index mapping: {e}")
                raise
    
    except Exception as e:
        logger.error(f"Error creating/updating index '{ELASTICSEARCH_INDEX}': {e}")
        raise

async def add_document_to_elasticsearch(
    filename: str, 
    content: str, 
    tables: List[Table], 
    embedding: list,
    user_id: int,
    document_id: int
):
    """Add a document with tables to Elasticsearch."""
    document = {
        "id": filename,
        "content": content,
        "embedding": embedding,
        "tables": [
            {
                "name": table.name,
                "content": table.content,
                "description": table.description
            }
            for table in tables
        ],
        "user_id": str(user_id),  # Convert to string as Elasticsearch keyword type
        "document_id": str(document_id),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    try:
        await es_client.index(
            index=ELASTICSEARCH_INDEX, 
            id=str(document_id),  # Use document_id as Elasticsearch document ID
            body=document
        )
        logger.info(f"Document '{filename}' indexed successfully for user {user_id}")
    except Exception as e:
        logger.error(f"Error indexing document '{filename}': {e}")
        raise

async def get_user_documents(user_id: int, skip: int = 0, limit: int = 100):
    """Get all documents belonging to a specific user."""
    try:
        query_body = {
            "query": {
                "term": {
                    "user_id": str(user_id)
                }
            },
            "sort": [
                {"created_at": {"order": "desc"}}
            ],
            "from": skip,
            "size": limit
        }
        
        response = await es_client.search(
            index=ELASTICSEARCH_INDEX,
            body=query_body
        )
        
        return response['hits']['hits']
    except Exception as e:
        logger.error(f"Error retrieving documents for user {user_id}: {e}")
        raise

async def delete_user_document(document_id: int, user_id: int):
    """Delete a document belonging to a specific user."""
    try:
        # First verify the document belongs to the user
        query_body = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"document_id": str(document_id)}},
                        {"term": {"user_id": str(user_id)}}
                    ]
                }
            }
        }
        
        # Delete matching documents
        result = await es_client.delete_by_query(
            index=ELASTICSEARCH_INDEX,
            body=query_body
        )
        
        if result['deleted'] == 0:
            logger.warning(f"No document found with ID {document_id} for user {user_id}")
            return False
        
        logger.info(f"Document {document_id} deleted successfully for user {user_id}")
        return True
    
    except Exception as e:
        logger.error(f"Error deleting document {document_id} for user {user_id}: {e}")
        raise

async def search_user_documents(user_id: int, query: str, embedding: list = None):
    """Search documents belonging to a specific user."""
    try:
        should_queries = [
            {"match": {"content": {"query": query, "boost": 1.0}}}
        ]
        
        if embedding:
            should_queries.append({
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                        "params": {"query_vector": embedding}
                    }
                }
            })
        
        query_body = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"user_id": str(user_id)}}
                    ],
                    "should": should_queries,
                    "minimum_should_match": 1
                }
            }
        }
        
        response = await es_client.search(
            index=ELASTICSEARCH_INDEX,
            body=query_body
        )
        
        return response['hits']['hits']
    
    except Exception as e:
        logger.error(f"Error searching documents for user {user_id}: {e}")
        raise