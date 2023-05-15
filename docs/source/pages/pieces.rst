.. _domino-pieces-page:

Pieces
======================

**Pieces** are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- have well defined data models for inputs, outputs and secrets (using Pydantic)
- run in isolated execution environments (Docker containers)
- are organized in git repositories, for easy distribution and installation

It is very easy to turn your Python code into a Domino Piece, in this session we'll guide you through it, step by step. 

|

Create your own Pieces
-------------------------

Domino defines standards for writing and distributing modular Pieces, which guarantees their reusability and consistency across Workflows. Those Pieces can be included in any Workflow by drag-and-drop, and Domino will take care of running them according to user defined schedules.

Let's define a new Piece, named `MyNewPiece`. The Piece's folder should have the same as the Piece (in this case `MyNewPiece`) and follow a standard organization, consisting in three files: 

- A :ref:`piece.py<domino-pieces-piecepy>` file with the source code to be executed
- A :ref:`models.py<domino-pieces-models>` file containing the Pydantic models that define the input, output and secrets of the Piece
- A :ref:`metadata.json<domino-pieces-metadata>` file containing the Piece's metadata, including dependencies and GUI style

.. code-block:: bash
    :caption: Example MyNewPiece folder and files structure

    /MyNewPiece
    ..../metadata.json
    ..../models.py
    ..../piece.py


.. _domino-pieces-piecepy:

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

.. _domino-pieces-models:

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

Additionally, the frontend will appropriately display input fields based on their respective data types.

.. raw:: html

    <details>
        <summary>
            <strong>Integer</strong>
        </summary>
            <pre><code id="python_code">int_value: int = Field(
                default=2,
                description="Example of int input"
            )</code></pre>
            <img src="../_static/media/int_field.gif" width=350px>
    </details>

    <br>

    <details>
        <summary>
            <strong>Float</strong>
        </summary>
            <pre><code id="python_code">float_value: float = Field(
                default=1.3,
                description="Example of float input"
            )</code></pre>
            <img src="../_static/media/float_field.gif" width=350px>
    </details>

    <br>

    <details>
        <summary>
            <strong>Text</strong>
        </summary>
            <pre><code id="python_code">string_value: str = Field(
                default="text value",
                description="Example of string input"
            )</code></pre>
            <img src="../_static/media/text_field.gif" width=350px>
    </details>

    <br>
    
    <details>
        <summary>
            <strong>Boolean</strong>
        </summary>
            <pre><code id="python_code">boolean_value: bool = Field(
                default=True,
                description="Example of boolean input"
            )</code></pre>
            <img src="../_static/media/boolean_field.gif" width=350px>
    </details>

        <br>

    <details>
        <summary>
            <strong>Enum</strong>
        </summary>
        You must create an Enum class with your key-values pairs in the models.py
            <pre><code id="python_code">class EnumType(str, Enum):
            key_1 = "value_1"
            key_2 = "value_2"</code></pre>
        Now you can use the Enum class to create an input data.
            <pre><code id="python_code">enum_value: EnumType = Field(
                default=EnumType.key_1,
                description="Example of enum input"
            )</code></pre>
            <img src="../_static/media/enum_field.gif" width=350px>
    </details>

.. _domino-pieces-metadata:

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



Add the Piece to Pieces repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Now that you have your new Piece ready, you need to add it to a :ref:`Pieces repository<domino-pieces-repo-page>` so it could be installed in a Domino workspace. 

|