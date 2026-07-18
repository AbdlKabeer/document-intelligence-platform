from fastapi import APIRouter, Depends
from elasticsearch_database import model
from llm.chatgpt import analyze_question_with_context, generate_response, check_query_intent
from operations.table_operations import table_operations
from operations.plot_operations import plot_operations
from analyzers.table_analysis import handle_table_analysis
from analyzers.plot_analysis import handle_plot_analysis
from analyzers.direct_analysis import handle_direct_calculation
from config import logger
from fastapi.responses import JSONResponse
from schemas import TableCalculation, DirectCalculation, QueryModel
from routes.auth import get_current_user
from elasticsearch_database import search_user_documents

router = APIRouter()

@router.post("/get_query_type/")
async def query_document(query: QueryModel, current_user = Depends(get_current_user)):
    """Gets the type of the question. returns {type: 'risk_analysis' | 'other'}."""

    question = query.question

    try:
        # Call the function to check the question's intent
        intent = await check_query_intent(question)
        
        if intent in ["risk_analysis", "other"]:
            return JSONResponse(content={"type": intent})
        else:
            return JSONResponse(content={"type": "other"})  # Fallback to "other" for unrecognized intents

    except Exception as e:
        logger.error(f"Error in query_document: {e}")
        return JSONResponse(status_code=500, content={"error": "An unexpected error occurred"})

    

@router.post("/query/")
async def query_document(query: QueryModel, current_user = Depends(get_current_user)):
    """Query documents and handle calculations if needed."""

    question = query.question

    try:
        # Generate embedding and get context from Elasticsearch
        query_embedding = model.encode(question).tolist()

        # Get relevant documents from Elasticsearch for the current user
        hits = await search_user_documents(
            user_id=current_user.id,
            query=question,
            embedding=query_embedding
        )
        
        if not hits:
            return JSONResponse(content={"answer": "No relevant documents found."})

        context = "\n".join([hit['_source']['content'] for hit in hits[:3]])
        
        # Analyze question
        question_analysis = await analyze_question_with_context(question, context)
        
        if question_analysis.is_calculation:
            if isinstance(question_analysis.calculation_type, TableCalculation):
                operation = question_analysis.calculation_type.operation

                if operation in table_operations:
                    result = await handle_table_analysis(question_analysis=question_analysis, hits=hits)
                    if result:
                        return generate_response(result=result, question=question, context=context)
                        
                elif operation in plot_operations:
                    result = await handle_plot_analysis(question_analysis=question_analysis, hits=hits)
                    if result:
                        return result

                else:
                    return JSONResponse(content={"answer": f"Unsupported table operation: {operation}"})
            
            
            elif isinstance(question_analysis.calculation_type, DirectCalculation):
                result = await handle_direct_calculation(question_analysis=question_analysis)
                if result:
                    return generate_response(result=result, question=question, context=context)

                
        return generate_response(result=None, question=question, context=context)

    except Exception as e:
        logger.error(f"Error in query_document: {e}")
        return JSONResponse(status_code=500, content={"error": "An unexpected error occurred"})
