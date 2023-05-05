.. image:: /_static/media/logo.png
   :width: 800

|

About
----------

Domino is an open source workflow management platform, containing:

- an intuitive Graphical User Interface that facilitates creating, editing and monitoring any type of Workflow, from data processing to machine learning
- a REST API that controls a running Apache Airflow instance, which is responsible for scheduling and executing Workflows
- a standard way of writing and publishing functional Pieces, which follows good practices for data modeling, documentation and distribution


[TODO - IMAGE, GIF OR VIDEO]

Creating a Workflow in the GUI is as simple as dragging and dropping Pieces to the canvas and connecting them. The user can also schedule the Workflow to run periodically, at a specific date/time, or trigger it manually. The monitoring page shows the status of each Workflow Piece in real time, including the logs and results of each run.

Every Domino Workflow corresponds to an Apache Airflow DAG, and each Piece corresponds to an Airflow task. Domino controls an Airflow instance, which is responsible for executing, scheduling and monitoring the Workflows (DAGs).

Pieces are functional units that can be reused in multiple Workflows. Pieces can execute anything that can be written in Python, and can be easily distributed and installed directly from Github repositories to be used in Domino Workflows.

|

Domino Pieces
~~~~~~~~~~~~~~~

Domino defines standards for writing and distributing modular Pieces, which guarantees their reusability and consistency across Workflows.
Those Pieces can be included in any Workflow by drag-and-drop, and Domino will take care of running them according to user defined schedules.

these Piece can serve heavy-weight (e.g. Machine Learning, data processing) as well as light-weight (e.g. sending emails) tasks

|

Domino Workflows
~~~~~~~~~~~~~~~~~~

Domino Workflows are a collection of Pieces, connected in a directed acyclic graph (DAG). Domino Workflows can be easily created, edited and monitored through the Domino GUI.

|

Domino vs Apache Airflow
~~~~~~~~~~~~~~~~~~~~~~~~~~

Domino makes use of Apache Airflow for Workflows management. You can think of Domino as Airflow with superpowers, where users can:

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

The basic Piece image comes already with many popular Python packages installed (Numpy, Scipy, ...) and should be sufficient for many simple Pieces. If you need more complex images to run your custom Pieces, check [THIS SESSION]() to see how you can declare extra dependencies or even pre-built images in your pieces repository.

|

Documentation
~~~~~~~~~~~~~~~~

.. toctree::
   :maxdepth: 1
   :caption: Run Domino

   pages/run_local_compose.rst
   pages/run_local_kind.rst
   pages/deployment_cloud.rst


.. toctree::
   :maxdepth: 1
   :caption: Pieces

   pages/pieces.md
   pages/pieces_repository.rst
   pages/testing_pieces_locally.md


.. toctree::
   :maxdepth: 1
   :caption: Domino components

   pages/domino_components_frontend.rst
   pages/domino_components_rest.rst
   pages/domino_components_database.rst
   pages/domino_components_python_package.rst


.. toctree::
   :maxdepth: 2
   :caption: API Reference


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
