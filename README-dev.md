# Kubernetes

When running the application in development mode using the key `DOMINO_DEPLOY_MODE=local-k8s-dev` in your `config.toml` file, the application will use the Kubernetes API to create some volumes mappings, allowing some development features:
1. Hot reloading for local domino package.
2. Use of local helm charts when creating the cluster.
3. Use of local frontend image in cluster.
4. Use of local rest image in cluster.
5. Hot reloading for local pieces repositories code.


### 1. Activating hot reloading for local domino package
If you want to run your cluster with hot reloading for your local domino package you should follow the next steps:
1. Go to your `config.toml` file in the `dev` section
2. Add the key `DOMINO_LOCAL_DOMINO_PACKAGE` with the value to the path of your `src/domino` folder of your local domino package. Example: `DOMINO_LOCAL_DOMINO_PACKAGE=path/to/your/domino/src/domino`

### 2. Using local helm charts when creating the cluster
If you need to test run your cluster with local helm charts you should follow the same steps as the previous section.
The applicaton will get the `helm` folder from the path `path/to/your/domino/helm/domino` based on the path you defined in the `DOMINO_LOCAL_DOMINO_PACKAGE` key.
So, edit your helm charts in the `path/to/your/domino/helm/domino` folder and the application will use them when creating the cluster.

### 3. Using local frontend image in cluster
If you want to run your cluster with a local frontend image you should follow the next steps:
1. Build your local frontend image. You can use the following command from the root of the project: `DOCKER_BUILDKIT=1 docker build -f ./frontend/Dockerfile.dev.k8s -t domino-frontend ./frontend`
2. Add the key `DOMINO_FRONTEND_IMAGE` with the value `domino-frontend` (or other tag you choose) to your `config.toml` file in the `dev` section.
**Important:** This will not activate hot reloading for your local frontend code. If you need to update your frontend code in the cluster you should build the image again.

### 4. Using local rest image in cluster
As the frontend image, if you want to run your cluster with a local rest image you should follow the next steps:
1. Build your local rest image. You can use the following command from the root of the project: `DOCKER_BUILDKIT=1 docker build -f ./rest/Dockerfile -t domino-rest ./rest`
2. Add the key `DOMINO_REST_IMAGE` with the value `domino-rest` (or other tag you choose) to your `config.toml` file in the `dev` section.

This will load your local rest image in the kind cluster.
**Important:** This will not activate hot reloading for your local rest code. If you need to update your rest code in the cluster you should build the image again.

### 5. Activating hot reloading for local pieces repositories code
You can activate hot reloading for the local code of your pieces repositories. To do so, you should follow the next steps:
1. Go to your `config.toml` file in the `dev` section
2. Add the key `<piece_repository_name>` with the value to the path of your `<piece_repository_name>` folder of your local pieces repository. Example: `default_domino_pieces=path/to/your/default_domino_pieces`
The `<piece_repository_name>` must be the same name in the piece repository `config.toml` file in `REPOSITORY_NAME` key.

The application will create a volume mapping between the path you specified and the path in the cluster where the pieces repository is mounted. This will allow you to update your pieces repository code and see the changes in the cluster without the need to build the image again.


# Docker Compose
You can run your application in development mode using docker compose file.
To do so, you should run using the `docker-compose-dev.yaml` file, as follows:
```bash
docker-compose -f docker-compose-dev.yaml up
```
This will activate some development features, such as:
1. Hot reloading for local domino package in `worker` and `scheduler` containers.
2. Hot reloading for `rest` code.
3. Hot reloading for `frontend` code.

**Important:** This will **not** activate hot reloading for your pieces repositories code and will **not** activate hot reloading for local domino package in the **pieces containers**. If you are running a piece and you need to have the domino package updated in the piece container you should update the piece image wit the domino development package you want to use.

**Workaround:** As mentioned before, currently we don't have a direct way to allow hot reloading for domino package in pieces containers, however, you can use the following workaround:

1. Go to `domino/src/domino/custom_operators/docker_operator.py` file.
2. In the `__init__` method and start the `mounts` variable with the following code:
```python
mounts = [
    Mount(source='/path/to/domino/src/domino', target='/home/domino/domino_py/', type='bind', read_only=True)
]
```
The `source` must be the path to your local domino package. The `target` must be the path where the domino package will be mounted in the pieces container, by default the pieces images are built to use `/home/domino/domino_py/`.
**DEPRECATED WARNING:** The target path will be deprecated in the next update since the pieces will be built using `/home/domino/domino_py/src/domino` as the default path for the domino package.

