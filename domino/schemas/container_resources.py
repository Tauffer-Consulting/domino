from pydantic import BaseModel, Field

class SystemRequirementsModel(BaseModel):
    cpu: str = Field(regex=r"^\d+\.*\d*m$")
    memory: str = Field(regex=r"^\d+\.*\d*Mi$")

class ContainerResourcesModel(BaseModel):
    requests: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu="100m", memory="128Mi"))
    limits: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu="100m", memory="128Mi"))