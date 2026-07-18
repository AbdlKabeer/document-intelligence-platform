direct_operations = {
    "sum": lambda x, y: x + y,
    "difference": lambda x, y: x - y,
    "product": lambda x, y: x * y,
    "division": lambda x, y: x / y if y != 0 else "undefined",
    "percentage": lambda base, rate: (base * rate) / 100  # Default rate is 10% if not specified
}