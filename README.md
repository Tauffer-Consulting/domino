

<p align="center">
  <img src="https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/media/logo.png" width="450" title="Domino">
</p>
<p align="center">
  <a href="https://pypi.org/project/domino-py">
    <img src="https://img.shields.io/pypi/v/domino-py?color=%231BA331&label=PyPI&logo=python&logoColor=%23F7F991%20">
  </a>
  <a href="https://artifacthub.io/packages/helm/domino/domino">
    <img src="https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/domino">
  </a>
  <a href="https://domino-py.readthedocs.io/en/latest/">
    <img alt="Read the Docs" src="https://img.shields.io/readthedocs/domino-py?label=Docs&logo=Read%20the%20Docs&logoColor=white">
  </a>
</p>


# Table of contents
- [About](#about)
- [Quick start](#quick-start)
- [GUI](#gui)
- [REST](#rest)
- [Pieces](#pieces)

<br>

# About
Domino is an open source workflow management platform, with:

- an intuitive [Graphical User Interface](#gui) that facilitates creating, editing and monitoring any type of Workflow, from data processing to machine learning
- a [REST API](#rest) that controls a running Apache Airflow instance
- a standard way of writing and publishing functional [Pieces](#pieces), which follows good practices for data modeling, documentation and distribution


Creating Workflows in the GUI is as simple as dragging and dropping Pieces to the canvas, and connecting them. The user can also schedule the Workflow to run periodically, at a specific date/time, or trigger it manually. The monitoring page shows the status of each Workflow Piece in real time, including the logs and results of each run.

Every Domino Workflow corresponds to an Apache Airflow DAG, and each Piece corresponds to an Airflow task. Domino controls an Airflow instance, which is responsible for executing, scheduling and monitoring the Workflows (DAGs).

Pieces are functional units that can be reused in multiple Workflows. Pieces can execute anything that can be written in Python, and can be easily distributed and installed directly from Github repositories to be used in Domino Workflows.

<br>

# Quick start

The Domino Python package can be installed via pip. We reccommend you install Domino in a separate Python environment.

```bash
pip install domino-py
```

You can then use Domino command line interface to easily run the Domino platform locally. Go to a new, empty directory and run the following command:

```bash
domino platform run-compose
```

This is a convenience command that will:
- Create the necessary folder structure for Domino and Airflow processes
- Create a docker-compose.yaml file
- Run the docker compose up command

This command might take up to a few minutes to execute, since it will download and run all the necessary docker images. If everything worked as expected, after all processes started successfully you should be able to navigate to `localhost:3000` to access the Domino frontend service.

Running the Domino platform locally with Docker compose is useful for development and testing purposes. For production environments, we recommend you install Domino in a Kubernetes cluster:
- Running Domino in a [local Kubernetes cluster with Kind](https://domino-py.readthedocs.io/en/latest/pages/platform.html)
- Running Domino in a [remote Kubernetes cluster](https://domino-py.readthedocs.io/en/latest/pages/deployment_cloud.html)

<br>

# GUI
The Domino frontend service is a React application that provides the GUI for easily creating, editing and monitoring Workflows. Here are some of its features:

<details>
  <summary>
    <strong>Install Pieces repositories</strong>
  </summary>
  Install bundles of Pieces to your Domino Workspaces direclty from Github repositories, and use them in your Workflows. <br></br>

  ![install pieces](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/3_install_pieces.gif)

</details>

<details>
  <summary>
    <strong>Create Workflows</strong>
  </summary>
  Create Workflows by dragging and dropping Pieces to the canvas, and connecting them. <br></br>

  ![create workflow](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/4_create_workflow.gif)

</details>

<details>
  <summary>
    <strong>Edit Pieces</strong>
  </summary>
  Edit Pieces by changing their input. Outputs from upstream Pieces are automatically available as inputs for downstream Pieces. Pieces can pass forward any type of data, from simple strings to heavy files, all automatically handled by Domino shared storage system. <br></br>

  ![edit pieces](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/5_edit_pieces.gif)

</details>

<details>
  <summary>
    <strong>Schedule Workflows</strong>
  </summary>
  Schedule Workflows to run periodically, at a specific date/time, or trigger them manually. <br></br>

  ![schedule workflows](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/6_edit_workflow.gif)
</details>

<details>
  <summary>
    <strong>Monitor Workflows</strong>
  </summary>
  Monitor Workflows in real time, including the status of each Piece, the logs and results of each run. <br></br>

  ![monitor workflow](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/7_monitor_workflow.gif)

</details>

<br>

# REST
The Backend service is a REST API that controls a running Apache Airflow instance. It is responsible for:

- executing operations requested by the frontend service
- interacting with the Airflow instance, including triggering, creating, editing and deleting Workflows (DAGs)
- interacting with the Domino Database

The REST service is written in Python, using the FastAPI framework. Read more about it in the [REST documentation](https://domino-py.readthedocs.io/en/latest/pages/rest.html).

<br>

# Pieces
Pieces are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- have well defined data models for inputs, outputs and secrets
- run in isolated execution environments (Docker containers)
- are organized in repositories, for easy distribution and installation

To facilitate the creation of Pieces, we provide a [template repository](https://github.com/Tauffer-Consulting/domino_pieces_repository_template) with the basic file structure and examples for data models, metadata, source code and dependencies.

In short, each Piece is a folder containing the following files:
- A `piece.py` file with the source code to be executed
- A `models.py` file containing the Pydantic models that define the input, output and secrets for the Piece
- A `metadata.json` file containing the Piece's metadata, including dependencies and GUI style

A repository contains multiples Pieces. Pieces with the same dependencies are automatically grouped together in a dependency group, and each dependency group is built into a Docker image. The Docker images are the self contained execution environments containing the Piece's source code and with all the necessary dependencies installed.

The Docker images are automatically built and published in the same Github repository as the Pieces. This organization makes it straightforward to install Pieces respositories in Domino Workspaces, to be used in Workflows.

Read more about Pieces and how to create them in the [Pieces documentation](https://domino-py.readthedocs.io/en/latest/pages/pieces.html).


<br>

# Platform

## GitSync
A good practice when running Airflow in a Kubernetes cluster is to use a GitSync container to sync DAGs from a Git repository to the Airflow services. 

## Shared storage structure
Shared workflow data could be stored in a remote source (e.g. S3 bucket) or locally (for dev and tests only).

```
/shared_storage
..../{workflow-id}
......../{run-id}
............/{task-id}
................/results
..................../log.txt
..................../result.npy
..................../result.html
................/report
................/xcom_out
..................../xcom_out.json
```