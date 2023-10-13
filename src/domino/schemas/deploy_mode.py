from enum import Enum


# Enum type for deploy_mode
class DeployModeType(str, Enum):
    local = "local"
    k8s = "k8s"
    dry_run = "dry_run"
