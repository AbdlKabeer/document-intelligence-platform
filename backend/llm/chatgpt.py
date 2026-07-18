from config import openai, logger
from schemas import QuestionAnalysis, CompanyReview
from fastapi.responses import JSONResponse
import asyncio
from llm.gpthelper import SectionGenerator

async def check_query_intent(question: str) -> str:
    """Check if the question is related to risk analysis."""
    prompt = f"""
    Analyze the following question and determine its intent.

    Question: {question}

    Please respond with "risk_analysis" if this question is related to risk analysis or risk assessment, 
    or "other" if it is not.
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that identifies the intent of questions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )
        
        answer = response.choices[0].message.content.strip()
        return answer
    
    except Exception as openai_error:
        logger.error(f"OpenAI error in check_query_intent: {openai_error}")
        raise Exception("Failed to determine question intent")


def generate_response(result, question, context):

    if result:
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers based on result or plot that was calculated or generated from the context respectively."},
                    {"role": "user", "content": f"Result: {result}\n\nQuestion: {question}"}
                ],
                temperature=0.3
            )
            answer = response.choices[0].message.content.strip()
            return JSONResponse(content={"answer": answer})
        except Exception as openai_error:
            logger.error(f"OpenAI error: {openai_error}")
            return JSONResponse(status_code=500, content={"error": "Failed to generate answer"})
    else:
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on provided context."},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
                ],
                temperature=0.3
            )
            answer = response.choices[0].message.content.strip()
            return JSONResponse(content={"answer": answer})
        except Exception as openai_error:
            logger.error(f"OpenAI error: {openai_error}")
            return JSONResponse(status_code=500, content={"error": "Failed to generate answer"})
    
    
# Question analysis function
async def analyze_question_with_context(question: str, document_context: str) -> QuestionAnalysis:
    """Analyze question using OpenAI to determine calculation requirements."""
    prompt = f"""
    Given the following question and document context, provide a detailed JSON analysis.

    Question: {question}

    Document Context (containing table information):
    {document_context}

    Analyze and provide:
    1. Is this a calculation question? (true/false)
    2. If it is a calculation:
    - Does it require a table? (true/false)
    - If it requires a table:
        * Which specific table identifier (e.g., 'table_1', 'table_2', etc.) is needed? 
        * What columns are needed from this table?
        * Brief description of why this table is relevant
    - If it doesn't require a table:
        * Identify if the operation is percentage-based. If so, label the operation as "percentage" and extract both the base value and the percentage rate if available.
        * Provide any additional operands, such as base values or other calculation-specific values.
        * If it is not a percentage-based operation, identify the operation and operands.
    - What operation is needed?

    List of operations to recognize:
    - Table operations: sum, average, count, max, min.
    - Direct operations: sum, difference, product, division, percentage.
    - Plot operations: line_plot, bar_plot, scatter_plot.

    Format your response as a JSON object with this structure:
    {{
        "is_calculation": bool,
        "calculation_type": {{
            "operation": string,  // Specify the recognized operation
            "table_required": bool,
            "table_info": {{
                "table_name": string,  // Use identifier like 'table_1'
                "table_description": string
            }} or null,
            "columns": [string] or null,
            "operands": [number/string] or null
        }} or null
    }}
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes questions and identifies calculation requirements and relevant data sources. For table names, you use identifiers like 'table_1', 'table_2', etc."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        result = response.choices[0].message.content
        return QuestionAnalysis.model_validate_json(result)

    except Exception as e:
        raise Exception(f"Failed to analyze question: {str(e)}")
    
async def generate_company_review(company_info: dict, yearly_data: dict) -> CompanyReview:
    """
    Generate a comprehensive company review by combining all sections.
    
    Args:
        company_info (dict): Company background information
        yearly_data (dict): Yearly financial data
        
    Returns:
        CompanyReview: Generated company review
    """
    try:
        generator = SectionGenerator()
        
        # Generate title
        title = "FEDERAL INLAND REVENUE SERVICE\n\nTax Risk Analysis\n\nPRELIMINARY FILE REVIEW\n"
        
        # Generate all sections concurrently
        sections = await asyncio.gather(
            generator.generate_background_section(company_info),
            generator.generate_company_overview_section(company_info),
            generator.generate_financial_highlights_section(yearly_data),
            generator.generate_taxation_history_section(company_info),
            generator.generate_investigation_focus_section(company_info, yearly_data),
            generator.generate_conclusion_section(company_info, yearly_data)
        )
        
        # Combine all sections
        full_review = "\n\n".join([title] + list(sections))
        
        return CompanyReview(review=full_review)
    
    except Exception as e:
        logger.error(f"Error in generate_company_review: {e}")
        raise Exception("Failed to generate company review")