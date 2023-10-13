import os
import tomli
import tomli_w
import yaml
import subprocess
from concurrent.futures import ThreadPoolExecutor
import base64
from pathlib import Path
from rich.console import Console
from yaml.resolver import BaseResolver
from cryptography.hazmat.primitives import serialization as crypto_serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend as crypto_default_backend
from tempfile import NamedTemporaryFile, TemporaryDirectory
from kubernetes import client, config

from domino.cli.utils.constants import COLOR_PALETTE, DOMINO_HELM_PATH, DOMINO_HELM_VERSION, DOMINO_HELM_REPOSITORY


class AsLiteral(str):
  pass

def represent_literal(dumper, data):
  return dumper.represent_scalar(BaseResolver.DEFAULT_SCALAR_TAG, data, style="|")

yaml.add_representer(AsLiteral, represent_literal)


console = Console()

def create_ssh_pair_key() -> None:
    # Create SSH key pair for GitHub Workflows
    console.print("Generating SSH key pair for GitHub Workflows...")
    key = rsa.generate_private_key(
        backend=crypto_default_backend(),
        public_exponent=65537,
        key_size=4096
    )

    private_key = key.private_bytes(
        crypto_serialization.Encoding.PEM,
        crypto_serialization.PrivateFormat.PKCS8,
        crypto_serialization.NoEncryption()
    )
    public_key = key.public_key().public_bytes(
        crypto_serialization.Encoding.OpenSSH,
        crypto_serialization.PublicFormat.OpenSSH
    )
    return private_key, public_key
    

def prepare_platform(
    cluster_name: str, 
    workflows_repository: str, 
    github_workflows_ssh_private_key: str, 
    github_default_pieces_repository_token: str,
    github_workflows_token: str,
    deploy_mode: str,
    local_pieces_repository_path: list,
    local_domino_path: str,
    local_rest_image: str,
    local_frontend_image: str,
    local_airflow_image: str,
) -> None:
    # Create local configuration file updated with user-provided arguments
    config_file_path = Path(__file__).resolve().parent / "config-domino-local.toml"
    with open(str(config_file_path), "rb") as f:
        config_dict = tomli.load(f)
    
    running_path = str(Path().cwd().resolve())
    config_dict["path"]["DOMINO_LOCAL_RUNNING_PATH"] = running_path
    config_dict["kind"]["DOMINO_KIND_CLUSTER_NAME"] = cluster_name
    config_dict['kind']['DOMINO_DEPLOY_MODE'] = deploy_mode

    if deploy_mode == 'local-k8s-dev':
        config_dict['dev']['DOMINO_AIRFLOW_IMAGE'] = local_airflow_image
        config_dict['dev']['DOMINO_REST_IMAGE'] = local_rest_image
        config_dict['dev']['DOMINO_FRONTEND_IMAGE'] = local_frontend_image
        config_dict['dev']['DOMINO_LOCAL_DOMINO_PACKAGE'] = local_domino_path
        for local_pieces_repository in local_pieces_repository_path:
            # Read repo config.toml to get repo name to map it to cluster path
            repo_config_file_path = Path(local_pieces_repository).resolve() / "config.toml"
            with open(str(repo_config_file_path), "rb") as f:
                repo_toml = tomli.load(f)
            
            repo_name = repo_toml['repository']['REPOSITORY_NAME'] 
            config_dict['dev'][repo_name] = local_pieces_repository

    config_dict['github']['DOMINO_GITHUB_WORKFLOWS_REPOSITORY'] = workflows_repository.split("github.com/")[-1].strip('/')

    if not github_workflows_ssh_private_key:
        private_key, public_key = create_ssh_pair_key()
        config_dict["github"]["DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY"] = base64.b64encode(private_key).decode('utf-8')
        config_dict["github"]["DOMINO_GITHUB_WORKFLOWS_SSH_PUBLIC_KEY"] = public_key.decode("utf-8")
    else:
        config_dict["github"]["DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY"] = github_workflows_ssh_private_key

    config_dict['github']['DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS'] = github_workflows_token
    config_dict['github']['DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN'] = github_default_pieces_repository_token
    
    with open("config-domino-local.toml", "wb") as f:
        tomli_w.dump(config_dict, f)

    console.print("")
    console.print(f"Domino is prepared to run at: {running_path}")
    console.print(f"You can check and modify the configuration file at: {running_path}/config-domino-local.toml")
    console.print("Next, run: `domino platform create`")
    console.print("")


def create_platform(install_airflow: bool = True, use_gpu: bool = False) -> None:
    # Load configuration values
    with open("config-domino-local.toml", "rb") as f:
        platform_config = tomli.load(f)

    # Create kind config file and run bash script to create Kind cluster
    kubeadm_config_patches = dict(
        kind="InitConfiguration",
        nodeRegistration=dict(
            kubeletExtraArgs={
                "node-labels": "ingress-ready=true"
            }
        )
    )
    extra_mounts_local_repositories = []
    
    domino_dev_private_variables_list = [
        "DOMINO_LOCAL_DOMINO_PACKAGE",
        "DOMINO_REST_IMAGE",
        "DOMINO_FRONTEND_IMAGE",
        "DOMINO_AIRFLOW_IMAGE"
    ]
    local_pieces_respositories = {key: value for key, value in platform_config['dev'].items() if key not in domino_dev_private_variables_list}
    if platform_config['kind']['DOMINO_DEPLOY_MODE'] == 'local-k8s-dev':
        for repo_name, repo_path in local_pieces_respositories.items():
            extra_mounts_local_repositories.append(
                dict(
                    hostPath=repo_path,
                    containerPath=f"/pieces_repositories/{repo_name}",
                    readOnly=True,
                    propagation='HostToContainer'
                )
            )
        if platform_config['dev'].get('DOMINO_LOCAL_DOMINO_PACKAGE'):
            domino_local_package_absolute_path = Path(platform_config['dev']['DOMINO_LOCAL_DOMINO_PACKAGE']).resolve()
            extra_mounts_local_repositories.append(
                dict(
                    hostPath=str(domino_local_package_absolute_path),
                    containerPath=f"/domino/domino_py/src/domino",
                    readOnly=True,
                    propagation='HostToContainer'
                )
            )

    kubeadm_parsed = AsLiteral(yaml.dump(kubeadm_config_patches))
    use_gpu_dict = {} if not use_gpu else {"gpus": True}
    kind_config = dict(
        kind="Cluster",
        apiVersion="kind.x-k8s.io/v1alpha4",
        nodes=[
            dict(
                role="control-plane",
                kubeadmConfigPatches=[kubeadm_parsed],
                extraPortMappings=[
                    dict(
                        containerPort=80,
                        hostPort=80,
                        listenAddress="0.0.0.0",
                        protocol="TCP"
                    ),
                    dict(
                        containerPort=443,
                        hostPort=443,
                        listenAddress="0.0.0.0",
                        protocol="TCP"
                    )
                ]
            ),
            dict(
                role="worker",
                extraMounts=[
                    dict(
                        hostPath=platform_config["path"]["DOMINO_LOCAL_RUNNING_PATH"] + "/workflow_shared_storage",
                        containerPath="/cluster_shared_storage",
                        readOnly=False,
                        propagation="Bidirectional"
                    ),
                    *extra_mounts_local_repositories
                ],
                **use_gpu_dict
            ),
        ]
    )
    with open("kind-cluster-config.yaml", "w") as f:
        yaml.dump(kind_config, f)

    cluster_name = platform_config["kind"]["DOMINO_KIND_CLUSTER_NAME"]
    
    # Delete previous Kind cluster
    console.print("")
    console.print(f"Removing previous Kind cluster - {cluster_name}...")
    result = subprocess.run(["kind", "delete", "cluster", "--name", cluster_name], capture_output=True, text=True)
    if result.returncode != 0:
        error_message = result.stderr.strip() if result.stderr else result.stdout.strip()
        raise Exception(f"An error occurred while deleting previous Kind cluster - {cluster_name}: {error_message}")
    console.print("")

    # Create new Kind cluster
    console.print(f"Creating new Kind cluster - {cluster_name}...")
    result = subprocess.run(["kind", "create", "cluster", "--name", cluster_name, "--config", "kind-cluster-config.yaml"])
    if result.returncode != 0:
        error_message = result.stderr.strip() if result.stderr else result.stdout.strip()
        raise Exception(f"An error occurred while creating Kind cluster - {cluster_name}: {error_message}")
    console.print("")
    console.print("Kind cluster created successfully!", style=f"bold {COLOR_PALETTE.get('success')}")

    # Install Ingress NGINX controller
    console.print("")
    console.print("Installing NGINX controller...")
    subprocess.run(["kubectl", "apply", "-f", "https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml"], stdout=subprocess.DEVNULL)
    result = subprocess.run(["kubectl", "wait", "--namespace", "ingress-nginx", "--for", "condition=ready", "pod", "--selector=app.kubernetes.io/component=controller", "--timeout=180s"])
    if result.returncode != 0:
        error_message = result.stderr.strip() if result.stderr else result.stdout.strip()
        raise Exception("An error occurred while installing NGINX controller: {error_message}")
    console.print("NGINX controller installed successfully!", style=f"bold {COLOR_PALETTE.get('success')}")
    console.print("")

    # Load local images to Kind cluster
    local_domino_airflow_image = platform_config.get('dev', {}).get('DOMINO_AIRFLOW_IMAGE', None)
    local_domino_frontend_image = platform_config.get('dev', {}).get('DOMINO_FRONTEND_IMAGE', None)
    local_domino_rest_image = platform_config.get('dev', {}).get('DOMINO_REST_IMAGE', None)

    if local_domino_airflow_image:
        console.print(f"Loading local Domino Airflow image {local_domino_airflow_image} to Kind cluster...")
        subprocess.run(["kind", "load", "docker-image", local_domino_airflow_image , "--name", cluster_name, "--nodes", f"{cluster_name}-worker"])
        domino_airflow_image = f'docker.io/library/{local_domino_airflow_image}'
    elif platform_config['kind']["DOMINO_DEPLOY_MODE"] == 'local-k8s-dev':
        domino_airflow_image = "ghcr.io/tauffer-consulting/domino-airflow-base:latest-dev" 
    else:  
        domino_airflow_image = "ghcr.io/tauffer-consulting/domino-airflow-base:latest" 

    if local_domino_frontend_image:
        console.print(f"Loading local frontend image {local_domino_frontend_image} to Kind cluster...")
        subprocess.run(["kind", "load", "docker-image", local_domino_frontend_image , "--name", cluster_name, "--nodes", f"{cluster_name}-worker"])
        domino_frontend_image = f"docker.io/library/{local_domino_frontend_image}"
    elif platform_config['kind']["DOMINO_DEPLOY_MODE"] == 'local-k8s-dev':
        domino_frontend_image = "ghcr.io/tauffer-consulting/domino-frontend:k8s-dev"
    else:
        domino_frontend_image = "ghcr.io/tauffer-consulting/domino-frontend:k8s"
    
    if local_domino_rest_image:
        console.print(f"Loading local REST image {local_domino_rest_image} to Kind cluster...")
        subprocess.run(["kind", "load", "docker-image", local_domino_rest_image , "--name", cluster_name, "--nodes", f"{cluster_name}-worker"])
        domino_rest_image = f'docker.io/library/{local_domino_rest_image}'
    elif platform_config['kind']["DOMINO_DEPLOY_MODE"] == 'local-k8s-dev':
        domino_rest_image = "ghcr.io/tauffer-consulting/domino-rest:latest-dev" 
    else:
        domino_rest_image = "ghcr.io/tauffer-consulting/domino-rest:latest" 

    # In order to use nvidia gpu in our cluster we need nvidia plugins to be installed.
    # We can use nvidia operator to install nvidia plugins.
    # References: 
    #     https://catalog.ngc.nvidia.com/orgs/nvidia/containers/gpu-operator
    #     https://jacobtomlinson.dev/posts/2022/quick-hack-adding-gpu-support-to-kind/
    if use_gpu:
        console.print("Installing NVIDIA GPU Operator...")
        nvidia_gpu_operator_add_repo_command = [
            "helm", "repo", "add", "nvidia", "https://nvidia.github.io/gpu-operator",
        ]
        subprocess.run(nvidia_gpu_operator_add_repo_command)
        helm_update_command = ["helm", "repo", "update"]
        subprocess.run(helm_update_command)

        # We don't need driver as we are using kind and our host machine already has nvidia driver that is why we are disabling it.
        nvidia_plugis_install_command = "helm install --wait --generate-name -n gpu-operator --create-namespace nvidia/gpu-operator --set driver.enabled=false"
        subprocess.run(nvidia_plugis_install_command, shell=True)

    # Override values for Domino Helm chart
    token_pieces = platform_config["github"]["DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN"]
    token_workflows = platform_config["github"]["DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS"]
    domino_values_override_config = {
        "github_access_token_pieces": token_pieces,
        "github_access_token_workflows": token_workflows,
        "frontend": {
            "enabled": True,
            "image": domino_frontend_image,
            "apiEnv": "dev" if platform_config['kind']["DOMINO_DEPLOY_MODE"] in ['local-k8s-dev', 'local-k8s'] else 'prod',
            "deployMode": platform_config['kind']["DOMINO_DEPLOY_MODE"]
        },
        "rest": {
            "enabled": True,
            "image": domino_rest_image,
            "workflowsRepository": platform_config['github']['DOMINO_GITHUB_WORKFLOWS_REPOSITORY'],
        },
    }

    # Override values for Airflow Helm chart
    airflow_ssh_config = dict(
        gitSshKey=f"{platform_config['github']['DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY']}",
    )
    airflow_ssh_config_parsed = AsLiteral(yaml.dump(airflow_ssh_config))

    workers_extra_volumes = []
    workers_extra_volumes_mounts = []
    workers = {}
    scheduler = {}
    if platform_config['kind']["DOMINO_DEPLOY_MODE"] == 'local-k8s-dev' and platform_config['dev'].get('DOMINO_LOCAL_DOMINO_PACKAGE'):
        workers_extra_volumes = [
            {
                "name": "domino-dev-extra",
                "persistentVolumeClaim": {
                    "claimName": "domino-dev-volume-claim"
                }
            }
        ]
        workers_extra_volumes_mounts = [
            {
                "name": "domino-dev-extra",
                "mountPath": "/opt/airflow/domino/domino_py/src/domino"
            }
        ]
        workers = {
            "workers": {
                "extraVolumes": workers_extra_volumes,
                "extraVolumeMounts": workers_extra_volumes_mounts,
            }
        }
        scheduler = {
            "scheduler": {
                "extraVolumes": workers_extra_volumes,
                "extraVolumeMounts": workers_extra_volumes_mounts,
            }
        }

    airflow_values_override_config = {
        "env": [
            {
                "name": "DOMINO_DEPLOY_MODE",
                "value": platform_config['kind']["DOMINO_DEPLOY_MODE"]
            },
        ],
        "images": {
            "useDefaultImageForMigration": False,
            "airflow": {
                "repository": domino_airflow_image,
                "tag": "latest",
                "pullPolicy": "IfNotPresent"
            }
        },
        "extraSecrets": {
            "airflow-ssh-secret": {
                "data": airflow_ssh_config_parsed
            }
        },
        "config": {
            "api": {
                "auth_backend": "airflow.api.auth.backend.basic_auth"
            },
        },
        "dags": {
            "gitSync": {
                "enabled": True,
                "wait": 60,
                "repo": f"ssh://git@github.com/{platform_config['github']['DOMINO_GITHUB_WORKFLOWS_REPOSITORY']}.git",
                "branch": "main",
                "subPath": "workflows",
                "sshKeySecret": "airflow-ssh-secret"
            },
        },
        **workers,
        **scheduler,
    }

    # Update Helm repositories
    subprocess.run(["helm", "repo", "add", "domino", DOMINO_HELM_REPOSITORY])
    subprocess.run(["helm", "repo", "add", "apache-airflow", "https://airflow.apache.org/"])  # ref: https://github.com/helm/helm/issues/8036
    subprocess.run(["helm", "repo", "update"])

    # Install Airflow Helm Chart
    if install_airflow:
        console.print('Installing Apache Airflow...')
        # Create temporary file with airflow values
        with NamedTemporaryFile(suffix='.yaml', mode="w") as fp:
            yaml.dump(airflow_values_override_config, fp)
            commands = [
                "helm", "install",
                "-f", str(fp.name),
                "airflow",
                "apache-airflow/airflow",
                "--version", " 1.9.0",
            ]
            subprocess.run(commands)

    # Install Domino Helm Chart
    local_domino_path = platform_config.get('dev', {}).get('DOMINO_LOCAL_DOMINO_PACKAGE')
    if platform_config.get('kind', {}).get('DOMINO_DEPLOY_MODE') == 'local-k8s-dev' and local_domino_path:
        console.print('Installing Domino using local helm...')
        helm_domino_path = Path(local_domino_path).parent.parent / "helm/domino"
        with NamedTemporaryFile(suffix='.yaml', mode="w") as fp:
            yaml.dump(domino_values_override_config, fp)
            commands = [
                "helm", "install",
                "-f", str(fp.name),
                "domino",
                helm_domino_path
            ]
            subprocess.run(commands)
    else:
        console.print('Installing Domino using remote helm...')
        with TemporaryDirectory() as tmp_dir:
            console.print("Downloading Domino Helm chart...")
            subprocess.run([
                "helm",
                "pull",
                DOMINO_HELM_PATH,
                "--version",
                DOMINO_HELM_VERSION,
                "--untar",
                "-d",
                tmp_dir
            ])
            with NamedTemporaryFile(suffix='.yaml', mode="w") as fp:
                yaml.dump(domino_values_override_config, fp)
                console.print('Installing Domino...')
                commands = [
                    "helm", "install",
                    "-f", str(fp.name),
                    "domino",
                    f"{tmp_dir}/domino",
                ]
                subprocess.run(commands)

    # For each path create a pv and pvc
    if platform_config['kind']['DOMINO_DEPLOY_MODE'] == 'local-k8s-dev':
        config.load_kube_config()
        k8s_client = client.CoreV1Api()
        v1 = client.RbacAuthorizationV1Api()

        # Create service account role binding with admin access for airflow worker
        role_binding_name_worker = "full-access-user-clusterrolebinding-worker"
        sa_name = "airflow-worker"
        cluster_role_binding_worker = client.V1ClusterRoleBinding(
            metadata=client.V1ObjectMeta(name=role_binding_name_worker),
            subjects=[
                client.V1Subject(
                    kind="ServiceAccount",
                    name=sa_name,
                    namespace="default"
                )
            ],
            role_ref=client.V1RoleRef(
                kind="ClusterRole",
                name="cluster-admin",
                api_group="rbac.authorization.k8s.io"
            )
        )
        console.print('Creating RBAC Worker Authorization for local dev')
        v1.create_cluster_role_binding(cluster_role_binding_worker)

        role_binding_name_scheduler = "full-access-user-clusterrolebinding-scheduler"
        sa_name = "airflow-scheduler"
        cluster_role_binding_scheduler = client.V1ClusterRoleBinding(
            metadata=client.V1ObjectMeta(name=role_binding_name_scheduler),
            subjects=[
                client.V1Subject(
                    kind="ServiceAccount",
                    name=sa_name,
                    namespace="default"
                )
            ],
            role_ref=client.V1RoleRef(
                kind="ClusterRole",
                name="cluster-admin",
                api_group="rbac.authorization.k8s.io"
            )
        )
        console.print('Creating RBAC Scheduler Authorization for local dev')
        v1.create_cluster_role_binding(cluster_role_binding_scheduler)

        for project_name in local_pieces_respositories.keys():
            console.log(f"Creating PV and PVC for {project_name}...")
            # Check if pv already exists
            persistent_volume_name = 'pv-{}'.format(str(project_name.lower().replace('_', '-')))
            persistent_volume_claim_name = 'pvc-{}'.format(str(project_name.lower().replace('_', '-')))
            pvc_exists = False
            try:
                k8s_client.read_namespaced_persistent_volume_claim(name=persistent_volume_claim_name, namespace='default')
                pvc_exists = True
            except client.rest.ApiException as e:
                if e.status != 404:
                    raise e

            if not pvc_exists:
                pvc = client.V1PersistentVolumeClaim(
                    metadata=client.V1ObjectMeta(name=persistent_volume_claim_name),
                    spec=client.V1PersistentVolumeClaimSpec(
                        access_modes=["ReadOnlyMany"],
                        volume_name=persistent_volume_name,
                        resources=client.V1ResourceRequirements(
                            requests={"storage": "300Mi"}
                        ),
                        storage_class_name="standard"
                    )
                )
                k8s_client.create_namespaced_persistent_volume_claim(namespace="default", body=pvc)

            pv_exists = False
            try:
                k8s_client.read_persistent_volume(name=persistent_volume_name)
                pv_exists = True
            except client.rest.ApiException as e:
                if e.status != 404:
                    raise e

            if not pv_exists:
                pv = client.V1PersistentVolume(
                    metadata=client.V1ObjectMeta(name=persistent_volume_name),
                    spec=client.V1PersistentVolumeSpec(
                        access_modes=["ReadWriteOnce"],
                        capacity={"storage": "1Gi"},
                        persistent_volume_reclaim_policy="Retain",
                        storage_class_name="standard",
                        host_path=client.V1HostPathVolumeSource(path=f"/pieces_repositories/{project_name}"),
                        claim_ref=client.V1ObjectReference(
                            namespace="default",
                            name=persistent_volume_claim_name,
                            kind="PersistentVolumeClaim"
                        ),
                        node_affinity=client.V1VolumeNodeAffinity(
                            required=client.V1NodeSelector(
                                node_selector_terms=[
                                    client.V1NodeSelectorTerm(
                                        match_expressions=[
                                            client.V1NodeSelectorRequirement(
                                                key="kubernetes.io/hostname",
                                                operator="In",
                                                values=["domino-cluster-worker"]
                                            )
                                        ]
                                    )
                                ]
                            )
                        )
                    )
                )
                k8s_client.create_persistent_volume(body=pv)
        
        if platform_config['dev'].get('DOMINO_LOCAL_DOMINO_PACKAGE'):
            console.print("Creating PV's and PVC's for Local Domino Package...")
            # Create pv and pvc for local dev domino
            pvc = client.V1PersistentVolumeClaim(
                metadata=client.V1ObjectMeta(name="domino-dev-volume-claim"),
                spec=client.V1PersistentVolumeClaimSpec(
                    access_modes=["ReadWriteMany"],
                    volume_name="domino-dev-volume",
                    resources=client.V1ResourceRequirements(
                        requests={"storage": "300Mi"}
                    ),
                    storage_class_name="standard"
                )
            )
            k8s_client.create_namespaced_persistent_volume_claim(namespace="default", body=pvc)
            pv = client.V1PersistentVolume(
                metadata=client.V1ObjectMeta(name="domino-dev-volume"),
                spec=client.V1PersistentVolumeSpec(
                    storage_class_name="standard",
                    access_modes=["ReadWriteMany"],
                    capacity={"storage": "2Gi"},
                    host_path=client.V1HostPathVolumeSource(path="/domino/domino_py/src/domino"),
                    claim_ref=client.V1ObjectReference(
                        namespace="default",
                        name="domino-dev-volume-claim",
                    ),
                    node_affinity=client.V1VolumeNodeAffinity(
                        required=client.V1NodeSelector(
                            node_selector_terms=[
                                client.V1NodeSelectorTerm(
                                    match_expressions=[
                                        client.V1NodeSelectorRequirement(
                                            key="kubernetes.io/hostname",
                                            operator="In",
                                            values=["domino-cluster-worker"]
                                        )
                                    ]
                                )
                            ]
                        )
                    )
                )
            )
            k8s_client.create_persistent_volume(body=pv)

    console.print("")
    console.print("K8s resources created successfully!", style=f"bold {COLOR_PALETTE.get('success')}")
    console.print("You can now access the Domino frontend at: http://localhost/")
    console.print("Domino's REST API: http://localhost/api/")
    console.print("Domino's REST API Swagger: http://localhost/api/docs")
    console.print("")


def destroy_platform() -> None:
    # Delete Kind cluster
    with open("config-domino-local.toml", "rb") as f:
        platform_config = tomli.load(f)
    cluster_name = platform_config["kind"]["DOMINO_KIND_CLUSTER_NAME"]
    console.print(f"Removing Kind cluster - {cluster_name}...")
    result = subprocess.run(["kind", "delete", "cluster", "--name", cluster_name], capture_output=True, text=True)
    if result.returncode != 0:
        error_message = result.stderr.strip() if result.stderr else result.stdout.strip()
        raise Exception(f"An error occurred while deleting Kind cluster - {cluster_name}: {error_message}")
    console.print("")
    console.print("Kind cluster removed successfully!", style=f"bold {COLOR_PALETTE.get('success')}")
    console.print("")


def run_platform_compose(detached: bool = False, use_config_file: bool = False, dev: bool = False) -> None:
    if use_config_file:
        console.print("Using config file...")
        with open("config-domino-local.toml", "rb") as f:
            platform_config = tomli.load(f)
        token_pieces = platform_config["github"].get("DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN")
        os.environ['DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN'] = token_pieces

    # Create local directories
    local_path = Path(".").resolve()
    domino_dir = local_path / "domino_data"
    domino_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["chmod", "-R", "777", "domino_data"])
    airflow_logs_dir = local_path / "airflow/logs"
    airflow_logs_dir.mkdir(parents=True, exist_ok=True)
    airflow_dags_dir = local_path / "airflow/dags"
    airflow_dags_dir.mkdir(parents=True, exist_ok=True)
    airflow_plugins_dir = local_path / "airflow/plugins"
    airflow_plugins_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["chmod", "-R", "777", "airflow"])    

    # Copy docker-compose.yaml file from package to local path
    docker_compose_path = Path(__file__).resolve().parent / "docker-compose.yaml"
    subprocess.run(["cp", str(docker_compose_path), "."])

    # Run docker-compose up
    cmd = [
        "docker", 
        "compose", 
        "up"
    ]
    if detached:
        cmd.append("-d")
    environment = os.environ.copy()
    if dev:
        environment['DOMINO_COMPOSE_DEV'] = '-dev'
    subprocess.Popen(cmd, env=environment)


def stop_platform_compose() -> None:
    # If "docker-compose.yaml" file is present in current working path, try run "docker compose down"
    docker_compose_path = Path.cwd().resolve() / "docker-compose.yaml"
    if docker_compose_path.exists():
        cmd = [
            "docker", 
            "compose", 
            "down"
        ]
        completed_process = subprocess.run(cmd)
        if completed_process.returncode == 0:
            print("Domino Platform stopped successfully. All containers were removed.")
    # If not, try to stop and remove containers by name
    else:
        def stop_and_remove_container(container_name):
            print(f"Stopping {container_name}...")
            process = subprocess.Popen(f"docker stop {container_name}", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            if process.returncode != 0:
                print(f"Command failed with error: {stderr.decode()}")
            else:
                print(stdout.decode())

            print(f"Removing {container_name}...")
            process = subprocess.Popen(f"docker rm {container_name}", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            if process.returncode != 0:
                print(f"Command failed with error: {stderr.decode()}")
            else:
                print(stdout.decode())
        
        try:
            container_names = [
                "domino-frontend",
                "domino-rest",
                "domino-postgres",
                "domino-docker-proxy",
                "airflow-domino-scheduler",
                "airflow-domino-worker",
                "airflow-webserver",
                "airflow-triggerer",
                "airflow-redis",
                "airflow-postgres",
                "airflow-flower",
                "airflow-cli",
                "airflow-init",
            ]
            with ThreadPoolExecutor() as executor:
                executor.map(stop_and_remove_container, container_names)
            print("Domino Platform stopped successfully. All containers were removed.")
        except Exception as e:
            print(f"An error occurred: {e}")
