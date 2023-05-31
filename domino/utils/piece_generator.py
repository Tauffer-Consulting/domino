from domino.base_piece import BasePiece


def create_piece(
    metadata: dict, 
    piece_function: callable, 
    generate_report: callable = None
):
    class NewPiece(BasePiece): pass

    # Operator name as used by Airflow
    NewPiece.__name__ = metadata.get("name", "BasePiece")
    
    # Operator custom function
    NewPiece.piece_function = piece_function

    # Operator custom Generate Report function
    if generate_report:
        NewPiece.generate_report = generate_report
    
    return NewPiece