import os
import structlog
import logging
import openai

# Logging setup
# Set up the basic configuration for the standard logging module
logging.basicConfig(level=logging.INFO)

# Configure structlog to integrate with logging
structlog.configure(
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    processors=[
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger(__name__)

# Set OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

# Environment variables and settings
UPLOAD_FOLDER = "./uploaded_docs/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
FILE_SIZE_LIMIT = int(os.getenv("FILE_SIZE_LIMIT", 10 * 1024 * 1024))  # 10 MB
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY").encode()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "https://127.0.0.1:9200")
ELASTICSEARCH_INDEX = "documents"
ELASTICSEARCH_USERNAME = os.getenv('ES_USERNAME')
ELASTICSEARCH_PASSWORD = os.getenv('ES_PASSWORD')
SQLALCHEMY_DATABASE_URL = os.getenv('DB_TYPE')+os.getenv('DB_NAME')
