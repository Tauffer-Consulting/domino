from github import Github, GithubException
from core.logger import get_configured_logger
from schemas.exceptions.base import ResourceNotFoundException, ForbiddenException, BaseException, UnauthorizedException

class GithubRestClient(Github):
    def __init__(self, token):
        super().__init__(token)
        self.logger = get_configured_logger(self.__class__.__name__)

    def _handle_exceptions(self, _exception):
        if _exception.status == 404:
            self.logger.info('Resource not found in github: %s', _exception)
            raise ResourceNotFoundException()
        elif _exception.status == 403 or _exception.status == 401:
            self.logger.info('Forbidden in github: %s', _exception)
            self.logger.exception(_exception)
            raise ForbiddenException(message='Github access token is invalid or does not have the required permissions.')
        # elif _exception.status == 401:
        #     self.logger.info('Unauthorized in github: %s', _exception)
        #     self.logger.exception(_exception)
        #     raise UnauthorizedException()
        else:
            self.logger.exception(_exception)
            raise BaseException('Error connecting to github service.')


    def get_contents(self, repo_name: str, file_path: str, commit_sha: str = None):
        """
        Get the contents of a file from a repository for a specific commit hash.
        If the hash is not defined, the latest commit is used.
        """
        try:
            repo = super().get_repo(repo_name)
            if not commit_sha:
                contents = repo.get_contents(file_path)
                return contents
            contents = repo.get_contents(file_path, ref=commit_sha)
            return contents
        except GithubException as e:
            self._handle_exceptions(e)

    
    def create_file(self, repo_name: str, file_path: str, content: str):
        """
        Create a file in a repository.
        """
        try:
            repo = super().get_repo(repo_name)
            commit_msg = 'Create file'
            repo.create_file(file_path, commit_msg, content)
        except GithubException as e:
            self.logger.info('Could not create file in github: %s', e)
            self._handle_exceptions(e)
    
    def delete_file(self, repo_name: str, file_path: str):
        try:
            repo = super().get_repo(repo_name)
            contents = repo.get_contents(file_path)
            repo.delete_file(contents.path, "Remove file", contents.sha)
        except GithubException as e:
            self.logger.info('Could not delete file in github: %s', e)
            self._handle_exceptions(e)

    def get_commits(self, repo_name: str, number_of_commits: int = 1):
        """
        Get all commits from the repository.
        """
        try:
            repo = super().get_repo(repo_name)
            commits = [e for e in repo.get_commits()[:number_of_commits]]
            return commits
        except GithubException as e:
            self._handle_exceptions(e)

    def get_tag(self, repo_name: str, tag_name: str):
        """
        Get a tag from a repository.
        """
        try:
            repo = super().get_repo(repo_name)
            tags = repo.get_tags()

            for tag in tags:
                if str(tag.name) == tag_name:
                    return tag
            return None
        except GithubException as e:
            self.logger.exception('Could not get tag in github: %s', e)
            self._handle_exceptions(e)

    def get_tags(self, repo_name: str, as_list=True):
        """
        Get all tags from a repository.
        """
        # github.GithubException.UnknownObjectException
        try:
            repo = super().get_repo(repo_name)
            tags = repo.get_tags()
            if as_list:
                tags = [e for e in tags]
            return tags
        except GithubException as e:
            self.logger.exception('Could not get tags in github: %s', e)
            self._handle_exceptions(e)


    def get_commit(self, repo_name: str, commit_sha: str):
        try:
            repo = super().get_repo(repo_name)
            commit = repo.get_commit(commit_sha)
            return commit
        except GithubException as e:
            self.logger.exception('Could not get commit in github: %s', e)
            self._handle_exceptions(e)

    def compare_commits(
        self, 
        repo_name: str,
        base_sha: str, 
        head_sha: str
    ):
        """
        Compare two commits and return the diff.
        """
        try:
            repo = super().get_repo(repo_name)
            diff = repo.compare(base_sha, head_sha)
            return diff
        except GithubException as e:
            self.logger.exception('Could not compare commits in github: %s', e)
            self._handle_exceptions(e)
