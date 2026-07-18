# Define plotting operations
plot_operations = {
    "line_plot": lambda df, x_col, y_col: df.plot(x=x_col, y=y_col, kind="line"),
    "bar_plot": lambda df, x_col, y_col: df.plot(x=x_col, y=y_col, kind="bar"),
    "scatter_plot": lambda df, x_col, y_col: df.plot(x=x_col, y=y_col, kind="scatter")
}