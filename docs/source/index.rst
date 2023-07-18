.. image:: /_static/media/logo.png
   :width: 800

|

Domino
=================

Domino is an open source workflow management platform, with:

- an intuitive :ref:`Graphical User Interface<domino-gui-page>` that facilitates creating, editing and monitoring any type of Workflow, from data processing to machine learning
- a :ref:`REST API<domino-rest-page>` that controls a running Apache Airflow instance, which is responsible for scheduling and executing Workflows
- a standard way of writing and publishing functional :ref:`Pieces<domino-pieces-page>`, which follows good practices for data modeling, documentation and distribution

Creating Workflows in the GUI is as simple as dragging and dropping Pieces to the canvas and connecting them. The user can also schedule the Workflow to run periodically, at a specific date/time, or trigger it manually. The monitoring page shows the status of each Workflow Piece in real time, including the logs and results of each run.


.. image:: /_static/media/7_create_workflow.gif
   :width: 800


Domino vs Apache Airflow
~~~~~~~~~~~~~~~~~~~~~~~~~~

Every Domino Workflow corresponds to an Apache Airflow DAG, and each Piece corresponds to an Airflow task. Domino controls an Airflow instance, which is responsible for executing, scheduling and monitoring the Workflows (DAGs).

You can think of Domino as Airflow with superpowers, where users can:

- create highly complex Workflows with simple point-and-click and drag-and-drop operations, in an user-friendly GUI
- make use of Pieces developed by other people, share and reuse your own Pieces
- collaborate in groups to edit and monitor Workflows
- experience a cleaner and more intuitive GUI for viewing Workflows results, including logs and richer reports with images and tables


Development
~~~~~~~~~~~~~

The source code of the project is available `here <https://github.com/Tauffer-Consulting/domino>`_.

Domino is a modular and open source software, which allows for contributions from a large spectrum of expertises, from DevOps to frontend developers:

- Frontend is written in ReactJS / Typescript
- REST API written in Python with FastAPI
- Worflows management is performed by Apache Airflow
- GitOps approach to host and version Pieces and Workflows
- Pieces data models are defined with Pydantic
- Pieces are built and distributed as Docker images, hosted in public repositories such as Github Container Registry
- Domino runs on Kubernetes, both in the cloud or locally (using Kind)
- Domino is distributed as a pip installable package and a Helm chart


Resources
~~~~~~~~~~~~~~~~

Here's a list of the main resources for Domino:

- `Python package <https://pypi.org/project/domino-py/>`_
- `Helm chart <https://artifacthub.io/packages/helm/domino/domino>`_
- `REST API image <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-rest>`_
- `Frontend image <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-frontend>`_
- `Airflow image with Domino extension <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-airflow-base>`_
- `Base Piece image <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-airflow-pod>`_


|


.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Run Domino

   pages/run_local_compose.rst
   pages/run_local_kind.rst
   pages/deployment_cloud.rst


.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Pieces

   pages/pieces.rst
   pages/pieces_create.rst
   pages/pieces_repository.rst
   pages/pieces_unit_testing.md


.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Domino components

   pages/domino_components_gui.rst
   pages/domino_components_rest.rst
   pages/domino_components_database.rst
   pages/domino_components_python_package.rst


.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: API Reference

