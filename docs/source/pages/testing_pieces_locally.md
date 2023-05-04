# Testing Pieces locally

Domino provides an auxiliary function to test Pieces, the run_dry_piece function.

Suppose you have created an Piece Repository and want to test the Pieces locally.
It's possible to run tests without the whole Domino infrastructure or a new Piece Repository release on GitHub.


**Pre-requisites:**
- Domino installed in your local environment. 
See Getting Start for installation instruction.
- A locally Piece Repository. The Pieces folder must follow the standard organization as explained in the Pieces section.

You just need to create a script importing the run_dry_piece and fill the arguments with the Piece variables:

```python
#testing_piece.py

from domino.scripts.run_piece_dry import run_piece_dry

run_piece_dry(
    
    #local piece repository path
    repository_folder_path="path/to/pieces_repository",

    #name of the piece
    piece_name="ExamplePiece",

    #values to the InputModel arguments
    piece_input={ 
        "in_argument_1": value,
        "in_argument_2": value,
        "in_argument_3": value
    }
    
    #values to the SecretModel arguments
    secret_input={ 
        "EXAMPLE_VAR_1": value,
        "EXAMPLE_VAR_2": value
    }
)
```

> **Note: for each Piece you must create a run_dry_piece function instance.**

The `piece_name` must be the same defined at Piece Folder.

The `piece_input` is a dict with the key values arguments defined in the Piece InputModel.

The `secret_input` is a dict with the key values arguments defined in the Piece SecretModel.
