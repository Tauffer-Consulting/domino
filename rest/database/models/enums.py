import enum


class RepositorySource(str, enum.Enum):
    github = 'github'
    default = 'default'

    class Config:
        use_enum_values = True


class PieceExecutionMode(str, enum.Enum):
    docker = 'docker'
    worker = 'worker'

    class Config:
        use_enum_values = True


class Permission(str, enum.Enum):
    owner = 'owner'
    read = 'read'

    class Config:
        use_enum_values = True


class UserWorkspaceStatus(str, enum.Enum):
    pending = 'pending'
    accepted = 'accepted'
    rejected = 'rejected'

    class Config:
        use_enum_values = True


class WorkflowScheduleInterval(str, enum.Enum):
    none = 'none'
    once = 'once'
    hourly = 'hourly'
    daily = 'daily'
    weekly = 'weekly'
    monthly = 'monthly'
    yearly = 'yearly'

    class Config:
        use_enum_values = True