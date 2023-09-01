import os

# Get the path of the current script (__init__.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the VERSION file
version_file_path = os.path.join(current_dir, 'VERSION')

# Read the version from the VERSION file
with open(version_file_path, 'r') as version_file:
    __version__ = version_file.read().strip()