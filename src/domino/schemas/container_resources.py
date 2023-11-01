from pydantic import BaseModel, Field


class SystemRequirementsModel(BaseModel):
    cpu: str = Field(pattern=r"^\d+\.*\d*m$")
    memory: str = Field(pattern=r"^\d+\.*\d*Mi$")


class ContainerResourcesModel(BaseModel):
    requests: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu="100m", memory="128Mi"))
    limits: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu="100m", memory="128Mi"))
    use_gpu: bool = False