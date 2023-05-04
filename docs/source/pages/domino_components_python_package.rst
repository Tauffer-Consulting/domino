Domino Python package
=========================

Pip installable Python package for the Domino API.

.. code-block:: bash

    pip install domino-py


The Domino python package brings a collection of convenience classes and functions to work with Domino. See more at `API documentation <https://docs>`_.


Task (Domino class)
~~~~~~~~~~~~~~~~~~~~

This class defines the objects for each task in the AirfLow dag. Once instantiated it returns a `DominoKubernetesPodPiece` object properly configured with the target Piece arguments, secrets and volume mounts.


DominoKubernetesPodPiece (Domino class)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This class is an extension of the Airflow's `KubernetesPodPiece` class. It adds some useful information such as secrets and upstream task ids as ENV variable into the container running the target Piece.


BasePiece (Domino class)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is the base class from which every custom Domino Piece should inherit from. It defines the common attributes and methods for all the Domino Pieces.


CLI
--------

The Domino command line interface helps users to set up and run a local Domino platform, as well as organize and validate their Domino Piece repositories.

