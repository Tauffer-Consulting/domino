<p align="center">
  <img src="https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/media/logo.png" width="450" title="Domino">
</p>
<p align="center"><i>Build amazing ideas, piece by piece.</i></p>
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

<br>

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

You can then use Domino command line interface to easily run the Domino platform locally (requires Docker compose). Go to a new, empty directory and run the following command:

```bash
domino platform run-compose
```

After all processes started successfully, navigate to `localhost:3000` to access the Domino frontend service.

Running the Domino platform locally with Docker compose is useful for development and testing purposes. For production environments, we recommend you install Domino in a Kubernetes cluster:
- Running Domino in a [local Kubernetes cluster with Kind](https://domino-py.readthedocs.io/en/latest/pages/platform.html)
- Running Domino in a [remote Kubernetes cluster](https://domino-py.readthedocs.io/en/latest/pages/deployment_cloud.html)

<br>

# GUI
The Domino frontend service is a React application that provides the GUI for easily creating, editing and monitoring Workflows. Here are some of its features:

<details>
  <summary>
    <strong>Access authentication</strong>
  </summary>
  Sign up and login to use the Domino platform. <br></br>

  ![signup and login](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/1_sign_up.gif)

</details>

<details>
  <summary>
    <strong>Create Workspaces</strong>
  </summary>
  Create new Workspaces and add your github access token. <br></br>

  ![create workspace](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/2_create_workspace_and_token.gif)

</details>

<details>
  <summary>
    <strong>Install Pieces repositories</strong>
  </summary>
  Install bundles of Pieces to your Domino Workspaces direclty from Github repositories, and use them in your Workflows. <br></br>

  ![install pieces](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/6_install_pieces.gif)

</details>

<details>
  <summary>
    <strong>Create Workflows</strong>
  </summary>
  Create Workflows by dragging and dropping Pieces to the canvas, and connecting them. <br></br>

  ![create workflow](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/7_create_workflow.gif)

</details>

<details>
  <summary>
    <strong>Edit Pieces</strong>
  </summary>
  Edit Pieces by changing their input. Outputs from upstream Pieces are automatically available as inputs for downstream Pieces. Pieces can pass forward any type of data, from simple strings to heavy files, all automatically handled by Domino shared storage system. <br></br>

  ![edit pieces](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/8_edit_pieces.gif)

</details>

<details>
  <summary>
    <strong>Schedule Workflows</strong>
  </summary>
  Schedule Workflows to run periodically, at a specific date/time, or trigger them manually. <br></br>

  ![schedule workflows](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/9_edit_workflow.gif)
</details>

<details>
  <summary>
    <strong>Monitor Workflows</strong>
  </summary>
  Monitor Workflows in real time, including the status of each Piece, the logs and results of each run. <br></br>

  ![monitor workflow](https://raw.githubusercontent.com/Tauffer-Consulting/domino/main/docs/source/_static/media/10_monitor_workflow.gif)

</details>

<br>

# Pieces
Pieces are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- :snake: can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- :traffic_light: have well defined data models for inputs, outputs and secrets
- :package: run in self-contained and isolated execution environments (Docker containers)
- :gear: are immutable, guaranteeing reproducibility of your workflows
- :octocat: are organized in repositories, for easy packaging, distribution and installation
- :bookmark_tabs: are properly versioned, tested and documented
- :zap: are plug-and-play and versatile, can be easily incorporated in any workflow

It is very easy to create and share your own Pieces:

- :one: write your Python function
- :two: define its data types (input, output and secrets)
- :three: define its dependencies (requirements.txt or Dockerfile)
- :four: publish it in a repository (public or private)

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
