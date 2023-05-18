.. _domino-pieces-page:

Pieces
======================

**Pieces** are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- have well defined data models for inputs, outputs and secrets (using Pydantic)
- run in isolated execution environments (Docker containers)
- are organized in git repositories, for easy distribution and installation

It is very easy to turn your Python code into a Domino Piece, in this session we'll guide you through it, step by step. 


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
-------------
The `piece.py` file should contain your custom code inside the `piece_function` method. The class for the Piece we're writing is defined here, and it should inherit from Domino `BasePiece`. Example:

.. code-block:: python

    from domino.base_piece import BasePiece
    from .models import InputModel, OutputModel
    from pathlib import Path

    class MyNewPiece(BasePiece):

        def piece_function(self, input_model: InputModel):
            # Your custom function code comes in here
            # You can access the input arguments using the input_model
            print(f"Inpu argument 1: {input_model.in_argument_1}")
            print(f"Inpu argument 2: {input_model.in_argument_2}")
            print(f"Inpu argument 3: {input_model.in_argument_3}")

            # You can access the secrets using the self.secrets, or directly using the os.environ
            print(f"Secret variable: {self.secrets.SECRET_VAR}")
            print(f"Secret variable: {os.environ.get('SECRET_VAR')}")

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

.. collapse:: Access secret variables

    Pieces can access secret variables using the :code:`self.secrets` attribute. The :code:`self.secrets` attribute is a Pydantic model, with the same structure as the :code:`SecretsModel` defined in the :code:`models.py` file. The secret variables are also available as environment variables, so you can also access them using the :code:`os.environ` dictionary.

    .. code-block:: python

        print(f"Secret variable: {self.secrets.SECRET_VAR}")
        print(f"Secret variable: {os.environ.get('SECRET_VAR')}")

    Secrets values are filled in the Domino GUI, in the Secrets tab of the Workspace config.


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


.. _domino-pieces-models:

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

Based on the :code:`InputModel`, the Domino GUI will appropriately display input fields based on their respective data types:

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


The :code:`OutputModel` defines the output data types of the Piece and allow for connected downstream Pieces to use this output data correctly. 

The :code:`SecretsModel` defines the secret variables that should be available to the Piece function. It is important to note that Secrets arguments names should be unique within the same pieces repository. If the same name is used for more than one Secret argument in the same repository, this will cause overwriting of the secret value in Domino.


.. _domino-pieces-metadata:

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
----------------------------------------

Now that you have your new Piece ready, you need to add it to a :ref:`Pieces repository<domino-pieces-repo-page>` so it could be installed in a Domino workspace. 

|