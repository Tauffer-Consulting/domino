from enum import Enum


class NodeType(str, Enum):
    default = "default"
    source = "source"
    sink = "sink"


def get_frontend_node_style(
    module_name: str,
    node_label: str = None,
    node_type: NodeType = "default",
    use_icon: bool = True,
    icon_class_name: str = "fas fa-circle",
    node_style: dict = None,
    icon_style: dict = None,
    **kwargs
):
    """Generates style for Frontend nodes"""
    if node_style is None:
        node_style = dict()
    if icon_style is None:
        icon_style = dict()
    return {
        "module": module_name,
        "label": node_label if node_label is not None else module_name,
        "nodeType": node_type,
        "nodeStyle": {
            "backgroundColor": "#dedede",
            **node_style
        },
        "useIcon": use_icon,
        "iconClassName": icon_class_name,
        "iconStyle": {
            "cursor": "pointer",
            **icon_style
        }
    }