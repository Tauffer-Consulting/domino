![domino logo](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/logo.png)

[![PyPI version](https://badge.fury.io/py/domino-py.svg)](https://badge.fury.io/py/domino-py)
[![Documentation Status](https://readthedocs.org/projects/domino-py/badge/?version=latest)](https://domino-py.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![create workflow](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/7_create_workflow.gif)

# Table of contents
- [About](#about)
- [Quick start](#quick-start)
- [GUI](#gui)
- [Pieces](#pieces)
- [REST](#rest)
- [Credits](#credits)

<br>

# About
Domino is an open source workflow management platform, with:

- :desktop_computer: an intuitive [Graphical User Interface](#gui) that facilitates creating, editing and monitoring any type of Workflow, from data processing to machine learning
- :package: a standard way of writing and publishing functional [Pieces](#pieces), which follows good practices for data modeling, documentation and distribution
- :gear: a [REST API](#rest) that controls a running Apache Airflow instance


Creating Workflows in the GUI is as simple as dragging and dropping Pieces to the canvas, and connecting them. The user can also schedule the Workflow to run periodically, at a specific date/time, or trigger it manually. The monitoring page shows the status of each Workflow Piece in real time, including the logs and results of each run.

Pieces are functional units that can be reused in multiple Workflows. Pieces can execute anything that can be written in Python, and can be easily distributed and installed directly from Github repositories to be used in Domino Workflows.

Every Domino Workflow corresponds to an Apache Airflow DAG, and each Piece corresponds to an Airflow task. Domino controls an Airflow instance, which is responsible for executing, scheduling and monitoring the Workflows (DAGs).

You can think of Domino as Airflow with superpowers:

- :desktop_computer: create highly complex Workflows with simple point-and-click and drag-and-drop operations, in an user-friendly GUI
- :package: make use of Pieces developed by other people, share and reuse your own Pieces
- :busts_in_silhouette: collaborate in groups to edit and monitor Workflows
- :chart_with_upwards_trend: experience a cleaner and more intuitive GUI for viewing Workflows results, including logs and richer reports with images and tables
- :minidisc: shared storage for tasks in the same workflow
- :arrows_counterclockwise: use gitSync to sync DAGs from files stored in a Git repository
- :wheel_of_dharma: scalable, Kubernetes-native platform
- :battery: powered by Apache Airflow for top-tier workflows scheduling and monitoring

<br>

# Quick start

The Domino Python package can be installed via pip. We reccommend you install Domino in a separate Python environment.

```bash
pip install domino-py
```

You can then use Domino command line interface to easily run the Domino platform locally (requires [Docker Compose V2](https://docs.docker.com/compose/)). Go to a new, empty directory and run the following command:

```bash
domino platform run-compose
```

After all processes started successfully, navigate to `localhost:3000` to access the Domino frontend service.

Running the Domino platform locally with Docker compose is useful for development and testing purposes. For production environments, we recommend you install Domino in a Kubernetes cluster:
- Running Domino in a [local Kubernetes cluster with Kind](https://domino-py.readthedocs.io/en/latest/pages/platform.html)
- Running Domino in a [remote Kubernetes cluster](https://domino-py.readthedocs.io/en/latest/pages/deployment_cloud.html)

<br>

# GUI
The Domino frontend service is a React application that provides the GUI for easily creating, editing and monitoring Workflows.

<br>

# Pieces
Pieces are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- :snake: can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- :traffic_light: have well defined data models for inputs, outputs and secrets
- :package: run in self-contained and isolated execution environments (Docker containers)
- :gear: are immutable, guaranteeing reproducibility of your workflows
- :octocat: are organized in git repositories, for easy packaging, distribution and installation
- :bookmark_tabs: are properly versioned, tested and documented
- :zap: are plug-and-play and versatile, can be easily incorporated in any workflow

It is very easy to create and share your own Pieces:

1️⃣ write your Python function as a Piece <br>
2️⃣ define the data types, dependencies, metadata and tests <br>
3️⃣ publish in a git repository (public or private)

The [Pieces repository template](https://github.com/Tauffer-Consulting/domino_pieces_repository_template) provides the basic structure, example files and automatic actions for a seamless Pieces creation experience.

Read more in the [Pieces documentation](https://domino-py.readthedocs.io/en/latest/pages/pieces.html).


<br>

# REST
The Backend service is a REST API that controls a running Apache Airflow instance. It is responsible for:

- executing operations requested by the frontend service
- interacting with the Airflow instance, including triggering, creating, editing and deleting Workflows (DAGs)
- interacting with the Domino Database

The REST service is written in Python, using the FastAPI framework. Read more about it in the [REST documentation](https://domino-py.readthedocs.io/en/latest/pages/rest.html).

<br>

# Credits
Domino is developed and maintained by [Tauffer Consulting](https://www.taufferconsulting.com/).
