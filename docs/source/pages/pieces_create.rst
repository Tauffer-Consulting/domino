.. _domino-pieces-create-page:

Create Pieces
======================

Domino defines standards for writing and distributing modular Pieces, which guarantees their reusability and consistency across Workflows. Those Pieces can be included in any Workflow by drag-and-drop, and Domino will take care of running them according to user choices.

It is very easy to turn your Python code into a Domino Piece, in this session we'll guide you through it, step by step: 

1. write your Python function inside the :ref:`piece.py<domino-pieces-create-piecepy>` file
2. define its data types inside the :ref:`models.py<domino-pieces-create-models>` file
3. define extra metadata options inside the :ref:`metadata.json<domino-pieces-create-metadata>` file
4. write tests for your Piece inside the :ref:`test_mynewpiecepy<domino-pieces-create-test>` file
5. define its :ref:`dependencies<domino-pieces-repository-dependencies>`
6. publish it in a :ref:`git repository<domino-pieces-repo-page>` (public or private)


Let's create a new Piece, named `MyNewPiece`. The Piece's folder should have the same name as the Piece (in this case `MyNewPiece`) and follow a standard organization: 

.. code-block:: bash
    :caption: Example MyNewPiece folder and files structure

    /MyNewPiece
    ..../metadata.json
    ..../models.py
    ..../piece.py
    ..../test_mynewpiece.py


.. _domino-pieces-create-piecepy:

piece.py
-------------
The `piece.py` file should contain your custom code inside the `piece_function` method. The class for the Piece we're writing is defined here, and it should inherit from Domino `BasePiece`. Example:

.. code-block:: python

    from domino.base_piece import BasePiece
    from .models import InputModel, SecretsModel, OutputModel
    from pathlib import Path

    class MyNewPiece(BasePiece):

        # Your custom function code comes in here
        def piece_function(self, input_data: InputModel, secrets_data: SecretsModel):
            
            # The Piece's input arguments are passed in the 'input_data' argument
            print(f"Inpu argument 1: {input_data.in_argument_1}")
            print(f"Inpu argument 2: {input_data.in_argument_2}")
            print(f"Inpu argument 3: {input_data.in_argument_3}")

            # The Piece's secrets are passed in the 'secrets_data' argument
            print(f"Secret variable: {secrets_data.SECRET_VAR}")

            # If you want to save files in a shared storage, to be used by other Pieces,
            # you should save them under self.results_path
            msg = "This is a text to be saved in a shared storage, to be read by other Pieces!"
            file_path = str(Path(self.results_path)/"msg.txt")
            with open(file_path, "w") as f:
                f.write(msg)
            
            # If you want to display results directly in the Domino GUI,
            # you should set the attribute self.display_result
            self.display_result = {
                "file_type": "txt",
                "file_path": file_path
            }
            
            # You should return the results using the Output model
            return OutputModel(
                out_argument_1="a string result",
                out_file_path=file_path
            )


.. collapse:: Save files in a shared storage

    Pieces can save files in a shared storage, to be used as input to downstream Pieces, by saving them under :code:`self.results_path`. The :code:`self.results_path` points to a shared storage path specific for that Piece, and it is automatically created when the Piece is executed. 

    .. code-block:: python

        msg = "This is a text to be saved in a shared storage, to be read by other Pieces!"
        file_path = str(Path(self.results_path)/"msg.txt")
        with open(file_path, "w") as f:
            f.write(msg)
    
    Besides saving files under :code:`self.results_path`, to make those files available as input to other Pieces, you should also return the file path in the :code:`OutputModel`:

    .. code-block:: python

        return OutputModel(
            out_argument_1="a string result",
            out_file_path=file_path
        )


.. collapse:: Display results in the Domino GUI

    Pieces can display results directly in the Domino GUI, by setting the attribute :code:`self.display_result` in one of two ways:

    1. Saving the result in a file, and passing the file path to the :code:`self.display_result` attribute:

    .. code-block:: python

        self.display_result = {
            "file_type": "txt",
            "file_path": file_path
        }

    2. Passing the result content directly to the :code:`self.display_result` attribute as a base64 encoded string:

    .. code-block:: python

        self.display_result = {
            "file_type": "txt",
            "base64_content": base64-encoded-string,
        }

    In either way, the :code:`file_type` should always be provided. Currently, the supported file types are: 
    
        - :code:`txt` 
        - :code:`json`
        - :code:`png` 
        - :code:`jpeg`
        - :code:`bmp`
        - :code:`tiff`
        - :code:`gif`
        - :code:`svg`
        - :code:`md`
        - :code:`pdf`
        - :code:`html`


.. _domino-pieces-create-models:

models.py
----------------

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
        out_file_path: str = Field(
            description="The path to a file saved in a shared storage"
        )

    class SecretsModel(BaseModel):
        """MyNewPiece Secrets"""
        SECRET_VAR: str = Field(
            description="Secret variable"
        )


Pydantic models are very powerful and rich in features. Using them properly will guarantee that your Piece will always be called with the correct input data types and that downstream Pieces will be able to use its output data as well. We can easily add informative descriptions, validation rules (e.g. regex for string type, min/max for numeric types) and make arguments required/optional using Pydantic models.

Based on the :code:`InputModel`, the Domino GUI will appropriately display input fields in the forms, based on their respective data types:

.. collapse:: Integer

    .. code-block:: python
        
        integer_arg: int = Field(
            default=2,
            description="Example of integer input argument"
        )
    
    .. image:: /_static/media/int_field.gif
        :width: 350


.. collapse:: Float

    .. code-block:: python
        
        float_arg: float = Field(
            default=1.3,
            description="Example of float input argument"
        )
    
    .. image:: /_static/media/float_field.gif


.. collapse:: Text: single line

    .. code-block:: python
        
        string_arg: str = Field(
            default="text value",
            description="Example of string input argument"
        )
    
    .. image:: /_static/media/text_field.gif


.. collapse:: Boolean

    .. code-block:: python
        
        boolean_arg: bool = Field(
            default=True,
            description="Example of boolean input argument"
        )
    
    .. image:: /_static/media/boolean_field.gif


.. collapse:: Enum

    You must first create an :code:`Enum` class with its corresponding options in the :code:`models.py`, then use this class as a type.

    .. code-block:: python
        
        from enum import Enum

        class EnumType(str, Enum):
            option_1 = "option_1"
            option_2 = "option_2"
        
        enum_arg: EnumType = Field(
            default=EnumType.option_1,
            description="Example of enum input argument"
        )
    
    .. image:: /_static/media/enum_field.gif


The :code:`OutputModel` defines the output data types of the Piece and allows for connected downstream Pieces to use this output data correctly. 

The :code:`SecretsModel` defines the secret variables that should be available to the Piece function. It is important to note that Secrets arguments names should be unique within the same Pieces repository. If the same name is used for more than one Secret argument in the same repository, Domino presumes that both Pieces are using the same secret value (e.g. the same access token to an external service).


.. _domino-pieces-create-metadata:

metadata.json
-------------------

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

The dependency files are stored in a separate folder inside the :ref:`Pieces repository<domino-pieces-repo-page>`.

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


.. _domino-pieces-create-test:

test_mynewpiece.py
-----------------------




Add the Piece to a repository
----------------------------------------

Now that you have your new Piece ready, you need to add it to a :ref:`Pieces repository<domino-pieces-repo-page>` so it could be installed in a Domino workspace. 

|