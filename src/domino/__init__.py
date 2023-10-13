from pathlib import Path


def _get_version():
    version_file_path = Path(__file__).parent / 'VERSION'

    with version_file_path.open('r') as version_file:
        return version_file.read().strip() 

__version__ = _get_version()