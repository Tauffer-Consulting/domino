Pieces unit testing
====================

Domino provides an auxiliary function to test Pieces, the :code:`piece_dry_run` function.

Suppose you have created an Piece Repository and want to test the Pieces locally. It's possible to run tests without the whole Domino platform or a new Piece Repository release on GitHub.


**Pre-requisites:**

- Domino installed in your local environment. 
- A local Piece folder,  in the standard organization as explained in the :ref:`Pieces section<domino-pieces-page>`.

You simply need to create a script importing the :code:`piece_dry_run` function and fill the arguments with the Piece inputs and secrets:

.. code-block:: python
    :caption: testing_piece.py

    from domino.scripts.piece_dry_run import piece_dry_run

    piece_dry_run(
        repository_folder_path="path/to/pieces_repository",
        piece_name="ExamplePiece",
        piece_input={ 
            "in_argument_1": value,
            "in_argument_2": value,
            "in_argument_3": value
        }
        secret_input={ 
            "EXAMPLE_VAR_1": value,
            "EXAMPLE_VAR_2": value
        }
    )


The `piece_name` must be the same defined at Piece Folder.
The `piece_input` is a dict with the key values arguments defined in the Piece InputModel.
The `secret_input` is a dict with the key values arguments defined in the Piece SecretModel.
