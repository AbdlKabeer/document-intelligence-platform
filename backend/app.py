from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch_database import es_client, create_index
from models import create_tables
from routes import upload, query, reset_index, documents, auth, chats, tax

# Initialize FastAPI
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register startup and shutdown event handlers
#app.add_event_handler("startup", startup)
#app.add_event_handler("shutdown", shutdown)
"""@app.lifespan()
async def lifespan(app: FastAPI):
    # Startup logic
    await create_tables()  # Create tables before starting Elasticsearch index creation
    await create_index()    # Your existing startup logic for Elasticsearch
    
    # Shutdown logic
    yield  # This is where FastAPI pauses for the lifespan context

    # Perform shutdown operations
    await es_client.close()  # Your existing shutdown logic"""
@app.on_event("startup")
async def startup_event():
    # Logic for startup, such as creating tables or connecting to databases
    await create_tables()  
    await create_index()

@app.on_event("shutdown")
async def shutdown_event():
    # Logic for shutdown, such as closing connections
    await es_client.close()

# Include route modules
app.include_router(upload.router, tags=["upload"])
app.include_router(query.router, tags=["query"])
app.include_router(reset_index.router, tags=["reset index"])
app.include_router(documents.router, tags=["documents"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chats.router, tags=["chats"])
app.include_router(tax.router, tags=["tax"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
