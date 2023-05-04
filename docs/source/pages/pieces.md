
# Pieces

An **Piece** is a way to bring useful Python functions into modular components reusable by any Workflow. It is very easy to turn your Python code into an Piece, in this session we'l guide you through it, step by step.

Let's define a new Piece, named `MyNewPiece`. The Piece's folder should have the sufix `Piece` and follow a standard organization, consisting in three files, to be able to be found and used by the Domino platform: 
```
/MyNewPiece
..../metadata.json
..../models.py
..../piece.py
```

## piece.py
The `piece.py` file contains your custom code. The class for the Piece we're writing is defined here, and it should inherit from Domino `BasePiece`. Example:
```
from domino.base_piece import BasePiece
from .models import InputModel, OutputModel


class ExamplePiece(BasePiece):

    def piece_function(self, input_model: InputModel):
        # Your custom function code comes here
        ...

        return OutputModel(out_argument_1="a string result")
```
<br>


## models.py
The `models.py` file contains the data models for the Input, Output and Secrets arguments for the Piece. Those should be defined as Pydantic models. Example:
```
from pydantic import BaseModel, Field


class InputModel(BaseModel):
    """Example Piece"""

    in_argument_1: float = Field(
        default=1.,
        description="an argument of numeric type with default value",
    )
    in_argument_2: str = Field(
        description="a required argument of string type"
    )
    in_argument_3: bool = Field(
        description="a required argument of boolean type"
    )


class OutputModel(BaseModel):
    """Example Piece"""

    out_argument_1: str = Field(
        description="an argument of string type"
    )

class SecretsModel(BaseModel):
    """
    Example Piece Secrets
    """

    EXAMPLE_VAR: str = Field(
        description="Example secret var"
    )
```

Pydantic models are very powerful and rich in features. Using them properly will guarantee that our Piece will always be called with the correct input data types and that we can be sure of the output data types as well. We can easily add informative descriptions, validation rules (e.g. regex for string type, min/max for numeric types) and make arguments required/optional using Pydantic models.


## metadata.json

The simplest `metadata.json` file should contain basic metadata related to the Piece:
```
{
    "name": "MyNewPiece",
    "description": "This Piece runs my super cool Python function!",
    "dependency": {
        "requirements_file": "requirements_0.txt"
    },
}
```

The `name` field is the official Piece's name and it should match the name of the folder. 
The `description` field should contain short and useful information describing our Piece. 
The `dependency` field contains information about the dependencies that are required to run our custom code. These dependencies are saved as files in the Pieces repository (see [Pieces repository]()). It can include:
- `requirements_file`: the name of a Python requirements file that can be installed with `pip install -r requirements.txt`.
- `dockerfile`: the name of a Dockerfile with instructions to build the Docker image serving this Piece

Optionally, we can also include style configurations for the visual node representing `MyNewPiece` in the Domino user interface.