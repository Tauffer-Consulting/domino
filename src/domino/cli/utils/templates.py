import textwrap
from string import Template

def piece_function(name: str):
    template = textwrap.dedent(\
    '''\
    from domino.base_piece import BasePiece

    from .models import InputModel, OutputModel


    class $name(BasePiece):
        def piece_function(self, input_data: InputModel):
            output_value = ""
            return OutputModel(output_field=output_value)
    ''')
    template = Template(template)
    return template.substitute({"name": name})

def piece_models(name: str):
    template = textwrap.dedent(\
    '''\
    from pydantic import BaseModel, Field

    class InputModel(BaseModel):
        """
        $name Input Model
        """

        field: str = Field(
            description="Input field.",
        )


    class OutputModel(BaseModel):
        """
        $name Output Model
        """

        field: str = Field(
            description="Output field.",
        )
    ''')
    template = Template(template)
    return template.substitute({"name": name})

def piece_test(name: str):
    template = textwrap.dedent(\
    '''\
    from domino.testing import piece_dry_run

    def test_$name():
        input = {"field": ""}
        output = piece_dry_run(
            "$name",
            input,
        )

        assert output["field"] is not None
    ''')
    template = Template(template)
    return template.substitute({"name": name})

def piece_metadata(piece_name: str):
    metadata = {
        "name": f"{piece_name}",
        "dependency": {
            "dockerfile": None,
            "requirements_file": None
        },
        "tags": [],
        "style": {
            "node_label": "Piece",
            "node_type": "default",
            "node_style": {
                "backgroundColor": "#ebebeb"
            },
            "useIcon": True,
            "icon_class_name": "fa-solid fa-circle",
            "iconStyle": {
                "cursor": "pointer"
            }
        },
    }

    return metadata