# Maps the storage types to the required list of credentials necessary to use this storage target
storage_types_required_variables = {
    "local": [],
    "s3": ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION_NAME"],
    "gcs": ["", ""],
    "dropbox": [""],
}