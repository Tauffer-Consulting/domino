Pieces unit testing
====================

Domino provides a convenient function to test Pieces, the :code:`piece_dry_run` function.

Suppose you created a Pieces repository and want to test the Pieces locally. It's possible to run tests without the whole Domino platform or a new repository release on GitHub.


**Pre-requisites:**

- :code:`domino-py` installed in your local environment. 
- A local Pieces repository folder, following the standard organization (see :ref:`Pieces section<domino-pieces-page>`).

You simply need to create a script importing the :code:`piece_dry_run` function and fill the arguments with the Piece inputs and secrets:

.. code-block:: python
    :caption: testing_piece.py

    from domino.testing.dry_run import piece_dry_run

    piece_dry_run(
        repository_folder_path="path/to/pieces_repository",
        piece_name="ExamplePiece",
        input_data={ 
            "in_argument_1": value,
            "in_argument_2": value,
            "in_argument_3": value
        }
        secrets_data={ 
            "EXAMPLE_VAR_1": value,
            "EXAMPLE_VAR_2": value
        }
    )


The `piece_name` must be the same defined at the Piece's Folder.

The `input_data` is a dict with the key-value arguments as defined in the Piece's InputModel.

The `secret_input` is a dict with the key-value arguments as defined in the Piece's SecretModel.
