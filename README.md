# LiveQ AI

A full-stack, AI-powered document intelligence and querying platform. LiveQ allows users to upload, process, and query complex documents (PDFs, Word documents, images) using state-of-the-art machine learning models and Retrieval-Augmented Generation (RAG).

## Project Structure

- **`frontend/`**: A modern web interface built with Next.js 15, React 19, and Shadcn UI. Features markdown rendering, interactive charts (Recharts), and a responsive design.
- **`backend/`**: A high-performance API built with FastAPI. It handles document parsing (OCR, PDF extraction), vector embeddings (Sentence Transformers, HuggingFace), search (Elasticsearch), and LLM integration (OpenAI).

## Core Features
- **Document Ingestion**: Supports parsing PDFs, Word documents, and images using OCR (Tesseract).
- **Semantic Search**: Utilizes Elasticsearch and HuggingFace models for fast, context-aware information retrieval.
- **AI-Powered Queries**: Answers questions interactively using OpenAI and local Transformer models.
- **Rich UI**: Displays responses with markdown, interactive charts, and PDF generation capabilities.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Elasticsearch (running locally or via cloud)

### Frontend Setup (`frontend/`)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Backend Setup (`backend/`)
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment: `python -m venv venv && source venv/bin/activate`
3. Install dependencies from the root directory: `pip install -r ../requirements.txt`
4. Start the FastAPI server: `uvicorn main:app --reload`
