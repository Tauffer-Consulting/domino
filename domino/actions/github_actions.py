import re
import sys
import os
from distutils.version import StrictVersion
from domino.version import __version__
from domino.client.github_rest_client import GithubRestClient

class Actions(object):
    github_client = GithubRestClient(token=os.environ.get("GITHUB_TOKEN"))
    repo_name = os.environ.get("GITHUB_REPOSITORY")

    @classmethod
    def _validate_package_version(cls):
        """
        Check if the version number is in the correct format.
        """
        matched = re.match(r'(\d+\.)?(\d+\.)?(\*|\d+)$', __version__)
        if matched:
            return __version__
        raise Exception("Invalid version number.")
    
    @classmethod
    def _check_github_releases_versions(cls):
        """
        Check if the version already exists or if the version number is smaller than the last release.
        """
        releases = cls.github_client.get_releases(repo_name=cls.repo_name)
        if not releases:
            return
        for release in releases:
            if release.tag_name == __version__:
                raise Exception("Version already exists.")
        
        last_release = releases[0]
        last_release_title = last_release.title
        if StrictVersion(last_release_title) > StrictVersion(__version__):
            raise Exception("Version number is smaller than the last release.")
        return

    @classmethod
    def create_github_release(cls):
        """
        Create a release on github with the version from version.py file.
        """
        cls._validate_package_version()
        cls._check_github_releases_versions()

        commits = cls.github_client.get_commits(repo_name=cls.repo_name)
        last_commit = commits[0]
        last_commit_sha = last_commit.sha
        release = cls.github_client.create_release(
            repo_name=cls.repo_name,
            version=__version__,
            tag_message=f"Release {__version__}",
            release_message=f"Release {__version__}",
            target_commitish=last_commit_sha
        )
        return release


if __name__ == '__main__':
    getattr(Actions, sys.argv[1])()