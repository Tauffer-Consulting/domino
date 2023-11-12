import re
import sys
import os
from packaging import version
import domino
from domino.client.github_rest_client import GithubRestClient


class Actions(object):
    github_client = GithubRestClient(token=os.environ.get("GITHUB_TOKEN"))
    repo_name = os.environ.get("GITHUB_REPOSITORY")
    new_tag = f"domino-py-{domino.__version__}"

    @classmethod
    def _validate_package_version(cls):
        """
        Check if the version number is in the correct format.
        """
        pattern = r"^domino-py-\d+\.\d+\.\d+$"
        matched = re.match(pattern, cls.new_tag)
        if matched:
            return cls.new_tag
        raise Exception(f"Invalid tag format: {cls.new_tag}")

    @classmethod
    def _check_github_releases_versions(cls):
        """
        Check if the version already exists or if the version number is smaller than the last release.
        """
        releases = cls.github_client.get_releases(repo_name=cls.repo_name)
        if not releases:
            return
        releases_py = [release for release in releases if "domino-py-" in release.tag_name]
        for release in releases_py:
            if release.tag_name == cls.new_tag:
                raise Exception("Version already exists.")
            release_tag_version = release.tag_name.split("-")[-1]
            if version.parse(release_tag_version) > version.parse(domino.__version__):
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
            version=cls.new_tag,
            tag_message=f"Release {cls.new_tag} Python package",
            release_message=f"Release {cls.new_tag} Python package",
            target_commit_sha=last_commit_sha
        )
        return release


if __name__ == '__main__':
    getattr(Actions, sys.argv[1])()