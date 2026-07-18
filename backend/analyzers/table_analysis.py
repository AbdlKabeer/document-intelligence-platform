import pandas as pd
import io
from fastapi.responses import JSONResponse
from operations.table_operations import table_operations

async def handle_table_analysis(question_analysis, hits):
    operation = question_analysis.calculation_type.operation
    columns = question_analysis.calculation_type.columns
    table_info = question_analysis.calculation_type.table_info

    matching_tables = []
    for hit in hits:
        if 'tables' in hit['_source']:
            for table in hit['_source']['tables']:
                if table['name'] == table_info.table_name:
                    matching_tables.append(table['content'])

    if not matching_tables:
        return JSONResponse(content={"answer": f"Could not find the required table: {table_info.table_name}"})

    for table_text in matching_tables:
        df = pd.read_csv(io.StringIO(table_text))
        if all(col in df.columns for col in columns):
            result = table_operations[operation](df, columns[0])
            if result:
                return result

    return None

