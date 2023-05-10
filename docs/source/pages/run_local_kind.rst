.. _domino-run-kind:

Run locally with Kind
=============================

This session will guide you through the steps necessary to run the Domino platform locally:

1. Install the necessary dependencies.
2. Create a Github repository to store your Workflows and create github access tokens.
3. Use :code:`domino platform prepare` to prepare the configuration of the platform.
4. Configure Workflows Repository GitSync.
5. Run the platform locally using :code:`domino platform create`.

|

Dependencies
-------------------

In order to run Domino locally, you need to have these dependencies installed:

- **Python** 3.8 or greater.
- **Docker Engine**. You can install it by following the instructions `here <https://docs.docker.com/engine/install/>`__.
- **kubectl**, the command line tool for interacting with Kubernetes. You can install it by following the instructions `here <https://kubernetes.io/docs/tasks/tools/install-kubectl/>`__.
- **Helm**, a package manager for Kubernetes. You can install it by following the instructions `here <https://helm.sh/docs/intro/install/>`__.  
- **Kind**, a local Kubernetes cluster. You can install it by following the instructions `here <https://kind.sigs.k8s.io/>`__.
- **Kind with GPU (optional)** Kind doesn't have official support for GPU, but there is a Fork made by Jacob Tomlinson that you can use to run Kind with GPU support. You can find the fork `here <https://github.com/jacobtomlinson/kind/pull/1/>`_ and his blog post about it `here <https://jacobtomlinson.dev/posts/2022/quick-hack-adding-gpu-support-to-kind/>`__.


The Domino Python package can be installed via pip. We reccommend you install Domino in a separate Python environment.

.. code-block::
  
  pip install domino-py

|

Workflows repository and Github tokens
-------------------------------------------------

Create a Github repository (either private or public) to be used as a remote storage for the Workflows files.



Next, you should create two `github access tokens <https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token>`__:

- :code:`DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS`, with **read and write** access to the Workflows repository
- :code:`DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN`, with **read-only** access to public Pieces repositories

:code:`DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS` can be configured as a fine-grained access token with only the necessary permissions:

- Contents (read and write)
- Metadata (read)
  
then you can store them as environment variables or just save them to use later with :code:`domino platform prepare` command.

.. code-block::

  # Token with read access to public Pieces repositories
  export DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=<your-read-write-workflows-repository-github-access-token>
  export DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN=<your-read-only-pieces-repositories-github-access-token>

|

Prepare the platform with Domino CLI
----------------------------------------------------

You can use Domino CLI to prepare the configuration file and environment variables necessary to run the Domino platform locally by running:

.. code-block::
  
  domino platform prepare

The :code:`domino platform prepare` command will ask you for the following information:

- **Local cluster name**: The name of the Kind cluster that will be created **(optional)**.
- **Workflows repository**: The Github repository you just created where the workflows will be stored **(required)**.
- **Github ssh private for Workflows repository**: The private ssh deploy key of the github workflows repository you just created **(optional)**. If not provided, it will generate a ssh key pair to be used as described in `Configure Workflows Repository GitSync`_
- **Github token for Pieces repository**: The Github access token with read access to public Pieces repositories **(required)**.
- **Github token for Workflows repository**: The Github access token with read and write access to the workflows repository **(required)**.

After that, it will create a configuration file :code:`config-domino-local.yaml` with values based on existing environment variables or the user input in the CLI steps.
This file contains the variables necessary to run the Domino platform locally. 
You can edit it according to your needs. A full description of all these variables can be found at `Local configuration file`_.  

Now you must configure the Workflows Repository GitSync.

Configure Workflows Repository GitSync
-------------------------------------------------
To configure the Workflows Repository GitSync you should open the :code:`config-domino-local.yaml` and copy the :code:`DOMINO_GITHUB_WORKFLOWS_SSH_PUBLIC_KEY` value.  
Then, you should add this value as a **deploy key** to your Github workflows repository. 
The deploy key section can be found in your workflows repository settings as shown in the image below:

.. image:: /_static/media/deploy-keys.png

With the workflows repository access configured, you can now create a local Domino platform running.

Create the platform with Domino CLI
-------------------------------------------------
.. code-block::
  
  domino platform create

This is a convenience command that will:

- Check if all the necessary variables are defined, either in the :code:`config-domino-local.yaml` file or as environment variables
- Create a Kind cluster
- Download and install the necessary Helm charts
- Expose the chosen services

If everything worked as expected, you should see a success message in your terminal. You can then navigate to :code:`localhost` to access the Domino frontend service.

.. image:: /_static/media/domino-create-success.png


Running with GPU support
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
If you have pieces that require GPU, you can run the Domino platform with GPU support. 
First, you must install the **Kind with GPU** version as reference in the `Dependencies`_ section, then you can run the :code:`domino platform create` command with the :code:`--use-gpu` flag:

.. code-block::

  domino platform create --use-gpu


Local configuration file
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
When running the :code:`domino platform prepare` command, some parameters will be automatically filled in the configuration file and others will be asked to the user.  
This is the content of the configuration file and the description of each of its variables:

.. code-block:: toml

  [path]
  DOMINO_LOCAL_RUNNING_PATH = ""

  [kind]
  DOMINO_KIND_CLUSTER_NAME = "domino-cluster"
  DOMINO_DEPLOY_MODE = "local-k8s"

  [github]
  DOMINO_GITHUB_WORKFLOWS_REPOSITORY = ""
  DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN = ""
  DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS = ""
  DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY = ""
  DOMINO_GITHUB_WORKFLOWS_SSH_PUBLIC_KEY = ""

  [domino_db]
  DOMINO_DB_HOST = "postgres"
  DOMINO_DB_PORT = "postgres"
  DOMINO_DB_USER = "postgres"
  DOMINO_DB_PASSWORD = "postgres"
  DOMINO_DB_NAME = "postgres"



* ```DOMINO_LOCAL_RUNNING_PATH``` **[Automatic]** - The path where the Domino platform is being created.
* ```DOMINO_KIND_CLUSTER_NAME``` **[Optional]** - The name of the Kind cluster.
* ```DOMINO_DEPLOY_MODE``` **[Automatic]** - The deploy mode. It should be set to **local-k8s**.
* ```DOMINO_GITHUB_WORKFLOWS_REPOSITORY``` **[Required]** - The Github repository where the workflows will be stored.
* ```DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN``` **[Required]** - The Github access token with read access to public Pieces repositories.
* ```DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS``` **[Required]** - The Github access token with read and write access to the workflows repository.
* ```DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY``` **[Optional]** - The private key of the Github deploy key pair used to access the workflows repository. If not provided, it will generate a ssh key pair to be used as described in `Workflows repository and Github tokens`_.
* ```DOMINO_GITHUB_WORKFLOWS_SSH_PUBLIC_KEY``` **[Automatic]** - The public key of the Github deploy key pair used to access the workflows repository. If **ssh private key** was not provided, it will generate a ssh key pair to be used and this value should be pasted in the Github repository deploy keys section as describe in `Workflows repository and Github tokens`_.
* ```DOMINO_DB_HOST``` **[Automatic]** - The database host. You can change it if you want to use an external database.
* ```DOMINO_DB_PORT``` **[Automatic]** - The database port. You can change it if you want to use an external database.
* ```DOMINO_DB_NAME``` **[Automatic]** - The database name. You can change it if you want to use an external database.
* ```DOMINO_DB_USER``` **[Automatic]** - The database user. You can change it if you want to use an external database.
* ```DOMINO_DB_PASSWORD``` **[Automatic]** - The database password. You can change it if you want to use an external database.

|

Local deployment for development
-----------------------------------

For development, you must configure some variables in the file :code:`kind-cluster-config.yaml` and in the Helm Charts.


Configuring Kind
~~~~~~~~~~~~~~~~~~~

In the platform working directory, open the file :code:`kind-cluster-config.yaml`, where you can edit the following lines:

.. code-block::

  # LOCAL DEV DOMINO - Change it to the path of your local domino package
  - hostPath: /path/to/local_domino_package

  # LOCAL DEV OPERATORS - Change it to the path of your local pieces repository. 
  # Note, when using this you will not be able to include remote repositories
  - hostPath: /path/to/local_pieces_package 

  # SHARED JOBS VOLUME - Change it to the path of your shared jobs volume. 
  # This is where the jobs will be stored when running locally.
  - hostPath: /path/to/shared_jobs_volume 

  # DAGs SYNC VOLUME - Change it to the path of your dags sync volume. 
  # This is where the dags will be stored when running locally.
  - hostPath: /path/to/dags_sync_volume 


Configuring Helm Charts
~~~~~~~~~~~~~~~~~~~~~~~~~~

After configuring the Kind cluster, we must configure the Helm Charts. We must configure the **gitSync** so we can sync our remote dags with the local Airflow Webserver.  

In the project root directory, open the file `k8s/airflow_helm_chart/values-dev.yaml`.  In the `values-dev.yaml` we should first add the github access token with access to the dags repository we want to sync.  

.. code-block::

  extraSecrets:
    airflow-ssh-secret:
      data: |
        gitSshKey: 'VERY-LONG-BASE-64-ENCODED-PRIVATE-KEY' # Add your private key here (base64 encoded)

Then we must set the github repository we want to sync.

.. code-block::

  dags:
    gitSync:
      enabled: true
      repo: ssh://git@github.com/GITHUB_ACCOUNT/WORKFLOWS_REPOSITORY.git # Add your repository here
      branch: main
      subPath: "dags"
      sshKeySecret: airflow-ssh-secret


Environment Variables
~~~~~~~~~~~~~~~~~~~~~~~~

The Domino REST API service needs access to github to be able to fetch the Pieces Repositories.
In order to do this, we need to set the `DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN`` (with read permission) as an environment variable:

.. code-block::

  export DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN=<YOUR_GITHUB_OPERATORS_REPOSITORIES_ACCESS_TOKEN>


Also, it needs the name of the repository where the workflows are stored and another access token with read/write privilegies. This is the same repository we configured in the Helm Chart in the gitSync section.  

.. code-block::

  export DOMINO_GITHUB_WORKFLOWS_REPOSITORY=<GITHUB_ACCOUNT/WORKFLOWS_REPOSITORY>
  export DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=<YOUR_GITHUB_WORKFLOWS_REPOSITORY_ACCESS_TOKEN>

  
If you are using a remote database you must also set the following environment variables:

.. code-block::

  export DOMINO_DB_HOST=<your-db-host>
  export DOMINO_DB_PORT=<your-db-port>
  export DOMINO_DB_USER=<your-db-user>
  export DOMINO_DB_PASSWORD=<your-db-password>
  export DOMINO_DB_NAME=<your-db-name>


Running Domino
~~~~~~~~~~~~~~~~~~~~~~~~

After configuring the Kind Config, Helm Charts and the environment variables, we can run Domino.
In the k8s directory, run the following command:

.. code-block::

  bash run_in_cluster.sh

**Note**: You must have the Docker daemon running in order to run the Domino using this script.  
**Note**: It can take a while for the Domino be ready since it will download and install all the necessary dependencies.

