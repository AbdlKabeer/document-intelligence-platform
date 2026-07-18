import pandas as pd
from typing import List
from schemas import Table

table_operations = {
    "sum": lambda df, col: df[col].sum(),
    "average": lambda df, col: df[col].mean(),
    "count": lambda df, col: df[col].nunique(),
    "max": lambda df, col: df[col].max(),
    "min": lambda df, col: df[col].min(),
}

# Helper functions for table processing
def process_table(table_data: List[List[str]], table_number: int, context: str = "") -> Table:
    """Convert table data into a pandas DataFrame and then to CSV string format."""
    # Clean the table data
    cleaned_table = [[str(cell).strip() if cell is not None else "" for cell in row] for row in table_data]
    
    # Create DataFrame
    df = pd.DataFrame(cleaned_table[1:], columns=cleaned_table[0])
    
    # Convert to CSV string
    csv_content = df.to_csv(index=False)
    
    # Generate name and description
    table_name = f"table_{table_number}"
    description = f"Table extracted from document containing columns: {', '.join(df.columns)}"
    
    return Table(table_name, csv_content, description)