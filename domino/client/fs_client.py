import fsspec
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import dropbox


# TODO - still a lot to do here, not working just yet

# TODO - add support for other storage types, see: fsspec.available_protocols()

# TODO - check if its advantageous to use FUSE with fsspec: https://filesystem-spec.readthedocs.io/en/latest/api.html#fsspec.fuse.run

class FileSystemClient(fsspec.AbstractFileSystem):
    # list of all available methods: https://filesystem-spec.readthedocs.io/en/latest/api.html#fsspec.spec.AbstractFileSystem

    def __init__(self, fs_type, fs_kwargs):

        if fs_type == "local":
            super().__init__("file")
            self.prefix = ""

        elif fs_type == "s3":
            # ref: https://s3fs.readthedocs.io/en/latest/api.html#s3fs.core.S3FileSystem
            super().__init__(
                "s3", 
                anon=False,
                key=fs_kwargs.get("aws_access_key_id", ""),  # access key ID
                secret=fs_kwargs.get("aws_secret_access_key", ""),  # secret access key
                client_kwargs={
                    'endpoint_url': 'https://s3.amazonaws.com', 
                    'region_name': fs_kwargs.get("aws_region_name", "us-east-1")
                }
            )
            self.prefix = ""

        elif fs_type == "gdrive":
            # TODO - Create credentials object and authenticate with Google Drive API
            creds = Credentials.from_authorized_user()
            service = build("drive", "v3", credentials=creds)

            # Mount file system from Google Drive
            super().__init__("gcs", service=service, token="cache")
            self.prefix = "gdrive://"

        elif fs_type == "dropbox":
            # TODO - Create Dropbox client object
            client = dropbox.Dropbox(fs_kwargs)

            # Mount file system from Dropbox
            super().__init__("dropbox", client=client)
            self.prefix = ""

        else:
            raise ValueError(f"Unsupported file system type: {fs_type}")

    def read_file(self, path):
        with self.open(self.prefix + path) as f:
            return f.read()