from operations.direct_operations import direct_operations

async def handle_direct_calculation(question_analysis):
    operation = question_analysis.calculation_type.operation
    operands = question_analysis.calculation_type.operands

    if operation in direct_operations:
        if len(operands) == 2 and all(isinstance(op, (int, float)) for op in operands):
            result = direct_operations[operation](operands[0], operands[1])
            return result

    return {"answer": "Invalid operands or unsupported operation."}
