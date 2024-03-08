import jinja2

# Python DAG file template
workflow_template = jinja2.Template(
    trim_blocks=True,
    source="""from datetime import datetime
from dateutil.parser import parse
from airflow import DAG
from domino.task import Task

dag_config_0 = {{ workflow_kwargs }}

# Parse datetime values
dt_keys = ['start_date', 'end_date']
dag_config = { k: (v if k not in dt_keys else parse(v)) for k, v in dag_config_0.items()}
dag_config = {**dag_config, 'is_paused_upon_creation': False}

with DAG(**dag_config) as dag:
{% for key, value in tasks_dict.items() %}
    {{ key }} = Task(
        dag,
        task_id='{{ key }}',
        workspace_id={{ value["workspace_id"] }},
        workflow_shared_storage={% if value["workflow_shared_storage"] %}{{ value["workflow_shared_storage"] }}{% else %}None{% endif %},
        container_resources={% if value["container_resources"] %}{{ value["container_resources"] }}{% else %}None{% endif %},
        piece={{ value["piece"] }},
        piece_input_kwargs={{ value["input_kwargs"] }}
    )()
{% endfor %}

{% for key, value in tasks_dict.items() %}
{% if "upstream" in value %}
    {{ key }}.set_upstream([globals()[t] for t in {{ value["upstream"] }}])
{% endif %}
{% endfor %}
"""
)