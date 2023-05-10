Domino Python package
=========================

Pip installable Python package for the Domino API.

.. code-block:: bash

    pip install domino-py


The Domino python package brings a collection of convenience classes and functions to work with Domino. See more at `API documentation <https://docs>`_.


Task (Domino class)
~~~~~~~~~~~~~~~~~~~~

This class defines the objects for each task in the AirfLow dag. Once instantiated it will return either a `DominoKubernetesPodOperator` or a `DominoDockerOperator` object, properly configured with the target Piece arguments, secrets and volume mounts.


DominoKubernetesPodOperator (Domino class)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This class is an extension of the Airflow's `KubernetesPodOperator` class. It adds Domino specific functionalities and information. Runtime information is passed as ENV variables to the container running the target Piece.


BasePiece (Domino class)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is the base class from which every custom Domino Piece should inherit from. It defines the common attributes and methods for all the Domino Pieces.


CLI
--------

The Domino command line interface helps users to set up and run a local Domino platform, as well as organize and validate their Domino Piece repositories.

