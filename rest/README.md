# Domino REST API 

## Running Domino Rest API locally:
  

### 1. You will need to set some environement variables in your local environment.
  
- **DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS** (required): This token is necessary so that Domino REST can use the Github API to access the Workflows repository.
- **DOMINO_DB_USER** (optional): default is postgres
- **DOMINO_DB_PASSWORD** (optional): default is postgres
- **DOMINO_DB_HOST** (optional): default is localhost
- **DOMINO_DB_PORT** (optional): default is 5432
- **DOMINO_DB_NAME** (optional): default is postgres

```bash
# Exporting env vars
export DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=<your-github-access-token>
export DOMINO_DB_USER=<your-db-user>
export DOMINO_DB_PASSWORD=<your-db-password>
export DOMINO_DB_HOST=<your-db-host>
export DOMINO_DB_PORT=<your-db-port>
export DOMINO_DB_NAME=<your-db-name>
```

### 2. In order to run the server you will need to install the dependencies, we suggest you create a virtual environment and install the dependencies in there. You can choose the way you want to create the virtual environment. Here is a suggestion:

```bash
# Create the virtual env with python 3.9
python3.9 -m venv venv 
# Activate the virtual env
source venv venv/bin/activate
# Install the dependencies
pip install -r requirements.txt
```    
Then you can run the server with:
```bash
python main.py
```
<br>

## Running Domino Rest API locally using docker-compose:
The docker-compose also need the **DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS** environment variables to be set in your local environment to be able to access the operators and workflows in the repository.

```bash
export DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=<your-github-access-token>
```

Then you can run the server and the database using the docker-compose with:
```bash
docker-compose up
```

The backend app will be running at `http://localhost:8000/` and you can check and test the available endpoints at `http://localhost:8000/docs`.
