Run locally with docker compose
=================================

.. warning:: You should never use this mode in production. It is intended for development and testing purposes only. To run Domino locally in an environment closer to a production environment, see :ref:`Run locally with Kind<domino-run-kind>`

This method is the simplest way to test Domino locally, it uses docker compose to run all the necessary services:

1. Install the necessary dependencies
2. Use Domino command line interface to run the platform locally



Dependencies
-------------------

In order to run Domino locally, you need to have these dependencies installed:

- **Python** 3.8 or greater.
- **Docker engine**. You can install it by following the instructions `here <https://docs.docker.com/engine/install/>`__.
- **Docker compose**. You can install it by following the instructions `here <https://docs.docker.com/compose/install/>`__.
- **Domino** Python package.


The Domino Python package can be installed via pip. We reccommend you install Domino in a separate Python environment.

.. code-block::
  
  pip install domino-py



Run locally using Domino CLI
----------------------------------------------------

You can use Domino command line interface to easily run the Domino platform locally.
Go to a new, empty directory and run the following command:

.. code-block::
  
  domino platform run-compose


This is a convenience command that will:

- Create the necessary folder structure for Domino and Airflow processes
- Create a :code:`docker-compose.yaml` file
- Run the :code:`docker compose up` command

This command might take up to a few minutes to execute, since it will download and run all the necessary docker images.
If everything worked as expected, after all processes started successfully you should be able to navigate to :code:`localhost:3000` to access the Domino frontend service.


To run with compose using the configuration variables from an existing Domino project's :code:`config-domino-local.toml`` file you can use the :code:`--use-config-file` flag.
Please ensure that the config-domino-local.toml file is located in the same directory you are running the command from.
.. code-block::
    
    domino platform run-compose --use-config-file

|