

<p align="center">
  <img src="./media/logo.png" width="450" title="Domino">
</p>
<p align="center">
  <img src="https://img.shields.io/pypi/v/domino-py?color=%231BA331&label=PyPI&logo=python&logoColor=%23F7F991%20">
  <img alt="Read the Docs" src="https://img.shields.io/readthedocs/domino-py?label=Docs&logo=Read%20the%20Docs&logoColor=white">
</p>


# Domino
Domino is an open source workflow management platform, with:

- an intuitive Graphical User Interface that facilitates authoring, editing and monitoring any type of Workflows, from data processing to machine learning
- a REST API that controls a running Apache Airflow instance
- a standard way of writing and publishing functional Pieces, which follows good practices for data modeling, documentation and distribution

<br>

# Domino structure

A Domino platform contains the following components:
- Frontend service
- REST api service
- Database
- Airflow services
- Github repository for GitSync of Workflows

<br>


## Shared storage structure:
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

<br>

# Pieces
Each Domino Piece will have:
- A `piece.py` file with the source code to be executed, as the `piece_function()`
- A `models.py` file containing the Pydantic models that define the input, output and secrets for the Piece
- A `metadata.json` file containing the Piece's metadata, including frontend node style

Each dependency group from a Pieces repository will build an independent Docker image. This dependency group image has the following basic file struture within `/home/domino`:
```
/pieces_repository
..../config.toml
..../pieces
......../{PIECE-NAME}
............/metadata.json    
............/model.py         
............/piece.py         
..../.domino
......../dependencies_map.json
......../compiled_metadata.json
..../dependencies
......../requirements.txt     # If dependency group was defined with a requirements.txt file
```