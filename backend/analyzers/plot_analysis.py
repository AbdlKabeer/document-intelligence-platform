import pandas as pd
import io
from fastapi.responses import StreamingResponse
import matplotlib.pyplot as plt
from operations.plot_operations import plot_operations

async def handle_plot_analysis(question_analysis, hits):
    operation = question_analysis.calculation_type.operation
    columns = question_analysis.calculation_type.columns
    if len(columns) < 2:
        return {"answer": "Please specify both X and Y columns for plotting."}

    x_col, y_col = columns[0], columns[1]

    for hit in hits:
        if 'tables' in hit['_source']:
            for table in hit['_source']['tables']:
                if table['name'] == question_analysis.calculation_type.table_info.table_name:
                    df = pd.read_csv(io.StringIO(table['content']))
                    if x_col in df.columns and y_col in df.columns:
                        fig, ax = plt.subplots()
                        plot_operations[operation](df, x_col, y_col)
                        ax.set_title(f"{operation.replace('_', ' ').title()} for {x_col} vs {y_col}")

                        buf = io.BytesIO()
                        plt.savefig(buf, format="png")
                        buf.seek(0)
                        plt.close(fig)

                        return StreamingResponse(buf, media_type="image/png")

    return {"answer": f"Required table or columns '{x_col}', '{y_col}' not found."}
