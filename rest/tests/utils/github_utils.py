import base64
from cryptography.hazmat.primitives import serialization as crypto_serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend as crypto_default_backend
import os
from domino.client.github_rest_client import GithubRestClient


def create_ssh_key_pair():
    key = rsa.generate_private_key(
        backend=crypto_default_backend(),
        public_exponent=65537,
        key_size=4096
    )
    private_key = key.private_bytes(
        crypto_serialization.Encoding.PEM,
        crypto_serialization.PrivateFormat.PKCS8,
        crypto_serialization.NoEncryption()
    )
    public_key = key.public_key().public_bytes(
        crypto_serialization.Encoding.OpenSSH,
        crypto_serialization.PublicFormat.OpenSSH
    )
    return private_key, public_key

def add_ssh_key_to_workflows_repository():
    private_key, public_key = create_ssh_key_pair()

    private_key = base64.b64encode(private_key).decode('utf-8')
    public_key = public_key.decode('utf-8')
    
    github_token = os.environ.get('DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS')
    github_workflows_repo = os.environ.get('DOMINO_GITHUB_WORKFLOWS_REPOSITORY')

    key_title = 'TESTS_DOMINO_WORKFLOWS_REPO_PUBLIC_KEY'
    github_client = GithubRestClient(token=github_token)
    github_deploy_key = github_client.get_key(
        repo_name=github_workflows_repo,
        title=key_title
    )
    if github_deploy_key:
        github_deploy_key.delete()
    github_client.create_key(
        repo_name=github_workflows_repo,
        title=key_title,
        key=public_key
    )


if __name__ == '__main__':
    add_ssh_key_to_workflows_repository()

