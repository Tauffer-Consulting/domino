.. _domino-pieces-page:

Pieces
======================

A **Piece** is a way to bring useful Python functions into modular components reusable by any Workflow. It is very easy to turn your Python code into a Domino Piece, in this session we'll guide you through it, step by step.

Let's define a new Piece, named `MyNewPiece`. The Piece's folder should have the same as the Piece (in this case `MyNewPiece`) and follow a standard organization, consisting in three files: 

- A :code:`piece.py` file with the source code to be executed
- A :code:`models.py` file containing the Pydantic models that define the input, output and secrets of the Piece
- A :code:`metadata.json` file containing the Piece's metadata, including dependencies and GUI style

.. code-block:: bash
    :caption: Example MyNewPiece folder and files structure

    /MyNewPiece
    ..../metadata.json
    ..../models.py
    ..../piece.py


piece.py
~~~~~~~~~~~~~
The `piece.py` file should contain your custom code inside the `piece_function` method. The class for the Piece we're writing is defined here, and it should inherit from Domino `BasePiece`. Example:

.. code-block:: python

    from domino.base_piece import BasePiece
    from .models import InputModel, OutputModel


    class MyNewPiece(BasePiece):

        def piece_function(self, input_model: InputModel):
            # Your custom function code comes here
            print(f"Inpu argument 1: {input_model.in_argument_1}")
            print(f"Inpu argument 2: {input_model.in_argument_2}")
            print(f"Inpu argument 3: {input_model.in_argument_3}")
            
            # Return the output model
            return OutputModel(out_argument_1="a string result")


models.py
~~~~~~~~~~~~~

The `models.py` file contains the data models for the Input, Output and Secrets arguments of the Piece. Those should be defined as Pydantic models. Example:

.. code-block:: python

    from pydantic import BaseModel, Field

    class InputModel(BaseModel):
        """MyNewPiece Input"""
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
        """MyNewPiece Output"""
        out_argument_1: str = Field(
            description="an argument of string type"
        )

    class SecretsModel(BaseModel):
        """MyNewPiece Secrets"""
        EXAMPLE_VAR: str = Field(
            description="Secret variable"
        )


Pydantic models are very powerful and rich in features. Using them properly will guarantee that your Piece will always be called with the correct input data types and that we can be sure of the output data types as well. We can easily add informative descriptions, validation rules (e.g. regex for string type, min/max for numeric types) and make arguments required/optional using Pydantic models.


metadata.json
~~~~~~~~~~~~~~~~

The simplest `metadata.json` file should contain basic metadata related to the Piece:

.. code-block::
    :caption: Example of basic metadata.json

    {
        "name": "MyNewPiece",
        "description": "This Piece runs my awesome Python function, in any Workflow!",
        "dependency": {
            "requirements_file": "requirements_0.txt"
        
    }

The `name` field is the official Piece's name and it should match the name of the folder and of the class. 
The `description` field should contain a short and useful description of your Piece. 
The `dependency` field contains the reference to a dependencies file that is required to run your custom code. It can contain either:

- :code:`requirements_file`, with the name of a Python requirements file.
- :code:`dockerfile`, with the name of a Dockerfile with instructions to build the Docker image serving this Piece

The dependency files are stored in the :ref:`Pieces repository<domino-pieces-repo-page>`.

Optionally, you can also include in the metadata: 

- style configurations for the visual node representing `MyNewPiece` in the Domino GUI, such as label and icon. Currently the available icons are the free options from `Font Awesome v5 <https://fontawesome.com/v5/search?m=free>`_.
- minimal and limit resources required to run the Piece, when running Domino in Kubernetes
- a list of tags

.. code-block::
    :caption: Example of extended metadata.json

    {
        "name": "MyNewPiece",
        "description": "This Piece runs my awesome Python function, in any Workflow!",
        "dependency": {
            "requirements_file": "requirements_0.txt"
        },
        "container_resources": {
            "requests": {
                "cpu": "100m",
                "memory": "128Mi"
            },
            "limits": {
                "cpu": "500m",
                "memory": "512Mi"
            }
        },
        "style": {
            "node_label": "My awesome Piece",
            "icon_class_name": "fas fa-database"
        },
        "tags": [
            "Awesome",
            "New"
        ]
    }


| 

Add the Piece to Pieces repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Now that you have your new Piece ready, you need to add it to a :ref:`Pieces repository<domino-pieces-repo-page>` so it could be installed in a Domino workspace. 

|