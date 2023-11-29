from pydantic import BaseModel, Field

class SystemRequirementsModel(BaseModel):
    cpu: int = Field(default=128)
    memory: int = Field(memory=100)


class ContainerResourcesModel(BaseModel):
    requests: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu=100, memory=128))
    limits: SystemRequirementsModel = Field(default=SystemRequirementsModel(cpu=100, memory=128))
    use_gpu: bool = False