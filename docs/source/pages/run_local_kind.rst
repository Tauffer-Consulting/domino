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
- **Deploy Mode**: The platform deploy mode. It should be set to **local-k8s** **(optional)**.
- **Local pieces repository path**: Local paths for domino pieces repositories **(optional)**. Only used for local development , see `Local deployment for development`_.
- **Local domino path**: Local path for domino package **(optional)**. Only used for local development , see `Local deployment for development`_.

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



* ``DOMINO_LOCAL_RUNNING_PATH`` **[Automatic]** - The path where the Domino platform is being created.
* ``DOMINO_KIND_CLUSTER_NAME`` **[Optional]** - The name of the Kind cluster.
* ``DOMINO_DEPLOY_MODE`` **[Automatic]** - The deploy mode. It should be set to **local-k8s**.
* ``DOMINO_GITHUB_WORKFLOWS_REPOSITORY`` **[Required]** - The Github repository where the workflows will be stored.
* ``DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN`` **[Required]** - The Github access token with read access to public Pieces repositories.
* ``DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS`` **[Required]** - The Github access token with read and write access to the workflows repository.
* ``DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY`` **[Optional]** - The private key of the Github deploy key pair used to access the workflows repository. If not provided, it will generate a ssh key pair to be used as described in `Workflows repository and Github tokens`_.
* ``DOMINO_GITHUB_WORKFLOWS_SSH_PUBLIC_KEY`` **[Automatic]** - The public key of the Github deploy key pair used to access the workflows repository. If **ssh private key** was not provided, it will generate a ssh key pair to be used and this value should be pasted in the Github repository deploy keys section as describe in `Workflows repository and Github tokens`_.
* ``DOMINO_DB_HOST`` **[Automatic]** - The database host. You can change it if you want to use an external database.
* ``DOMINO_DB_PORT`` **[Automatic]** - The database port. You can change it if you want to use an external database.
* ``DOMINO_DB_NAME`` **[Automatic]** - The database name. You can change it if you want to use an external database.
* ``DOMINO_DB_USER`` **[Automatic]** - The database user. You can change it if you want to use an external database.
* ``DOMINO_DB_PASSWORD`` **[Automatic]** - The database password. You can change it if you want to use an external database.

|


Local deployment for development
-----------------------------------

For development, you can configure hot reloading for the **Domino package** and for **local Pieces Repositories**.
In order to do that you can run :code:`domino platform prepare` and you will be asked for the same configuration as described in `Prepare the platform with Domino CLI`_,
but now you must set :code:`deploy_mode=local-k8s-dev` and provide the local paths for the Domino package and for the local Pieces Repositories for hot reloading purposes.

- **Deploy Mode**: The platform deploy mode. It should be set to **local-k8s-dev** **(required)**.
- **Local pieces repository path**: Local paths for domino pieces repositories **(optional)**. Only used for hot reloading on pieces code. You can provide multiple paths as a list of strings, example:
  :code:`["path/to/pieces/repository1", "path/to/pieces/repository2"]`. It will allow you to change the code in the local pieces repositories and the changes will be reflected in the Domino platform without the need to rebuild the docker images.
- **Local domino path**: Local path for domino package **(optional)**. Only used for hot reloading of domino package code, example: :code:`/path/to/local/domino`

It can be also configured directly in the :code:`config-domino-local.yaml` file in :code:`dev` section.
The final configuration file should look like this:

.. image:: /_static/media/configtoml_example.png