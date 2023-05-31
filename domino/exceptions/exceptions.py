class InvalidPieceOutputError(Exception):
    """
    Raised when the Operator's output data is not an instance of the Operator's OutputModel
    """

    def __init__(self, piece_name: str):
        message = f"The output data for {piece_name} is not an instance of its OutputModel"
        super().__init__(message)


class MissingPieceRepositoryFileError(Exception):
    """
    Raised when there's a missing required file from Operators repository
    """

    def __init__(self, missing_file: str, pieces_repository: str):
        message = f"The file {missing_file} is not present in {pieces_repository} pieces repository"
        super().__init__(message)


class MissingEnvVarError(Exception):
    """
    Raised when there's a required ENV var missing on running environment
    """

    def __init__(self, missing_vars: list):
        message = "The required secrets are not present in running environment: " + '\n' + '\n'.join(missing_vars)
        super().__init__(message)


class NoMatchingDependencyForPieceError(Exception):
    """
    Raised when there's no matching dependency for the given Operator in the dependencies_map.json file
    """

    def __init__(self, piece_name: str, repo_name: str):
        message = f"There's no matching dependency group for {piece_name} from repository {repo_name}. Please make sure to run 'domino organize' in the target repository."
        super().__init__(message)