from airflow.utils.task_group import TaskGroup
from airflow.decorators import task


class MyCustomMathTaskGroup(TaskGroup):
    """A task group summing two numbers and multiplying the result with 23."""

    # defining defaults of input arguments num1 and num2
    def __init__(self, group_id, num1=0, num2=0, tooltip="Math!", **kwargs):
        """Instantiate a MyCustomMathTaskGroup."""
        super().__init__(group_id=group_id, tooltip=tooltip, **kwargs)

        # assing the task to the task group by using `self`
        @task(task_group=self)
        def task_1(num1, num2):
            """Adds two numbers."""
            return num1 + num2

        @task(task_group=self)
        def task_2(num):
            """Multiplies a number by 23."""
            return num * 23

        # define dependencies
        task_2(task_1(num1, num2))