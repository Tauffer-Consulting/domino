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

[TODO - IMAGE, GIF OR VIDEO]

|

Domino vs Apache Airflow
~~~~~~~~~~~~~~~~~~~~~~~~~~

Every Domino Workflow corresponds to an Apache Airflow DAG, and each Piece corresponds to an Airflow task. Domino controls an Airflow instance, which is responsible for executing, scheduling and monitoring the Workflows (DAGs).

You can think of Domino as Airflow with superpowers, where users can:

- create highly complex Workflows with point-and-click and drag-and-drop operations in an user-friendly UI
- make use of Pieces developed by other people, share and reuse their own Pieces
- collaborate in groups to edit and monitor Workflows
- experience a cleaner and more intuitive UI for viewing Workflows results, including logs and richer reports with images and tables

|

Development
~~~~~~~~~~~~~

Domino is a modular and open source software, which allows for contributions from a large spectrum of expertises, from DevOps to frontend developers:

- Frontend is written in ReactJS / Typescript
- REST API written in Python with FastAPI
- Worflows management is performed by Apache Airflow
- GitOps approach to host and version Pieces and Workflows
- Pieces data models are defined with Pydantic
- Pieces are built and distributed as Docker images, hosted in public repositories such as Github Container Registry
- Domino runs on Kubernetes, both in the cloud or locally (using Kind)
- Domino is distributed as a pip installable package and a Helm chart

|

Docker images
~~~~~~~~~~~~~~~~

We maintain the updated Docker images for the necessary Domino components in Github Container Registry:

- `REST API component <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-rest>`_
- `Frontend component <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-frontend>`_
- `Airflow components with Domino extension <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-airflow-base>`_
- `Base Piece image <https://github.com/Tauffer-Consulting/domino/pkgs/container/domino-airflow-pod>`_

The base Piece image comes already with many popular Python packages installed (Numpy, Scipy, ...) and should be sufficient for many simple Pieces. If you need more complex images to run your custom Pieces, check [THIS SESSION]() to see how you can declare extra dependencies or even pre-built images in your pieces repository.

|

Table of contents
~~~~~~~~~~~~~~~~~~~

.. toctree::
   :maxdepth: 1
   :caption: Run Domino

   pages/run_local_compose.rst
   pages/run_local_kind.rst
   pages/deployment_cloud.rst


.. toctree::
   :maxdepth: 1
   :caption: Pieces

   pages/pieces.rst
   pages/pieces_repository.rst
   pages/testing_pieces_locally.md


.. toctree::
   :maxdepth: 1
   :caption: Domino components

   pages/domino_components_gui.rst
   pages/domino_components_rest.rst
   pages/domino_components_database.rst
   pages/domino_components_python_package.rst


.. toctree::
   :maxdepth: 2
   :caption: API Reference

