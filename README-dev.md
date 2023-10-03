## Kubernetes

When running the application in development mode using the key `DOMINO_DEPLOY_MODE=local-k8s-dev` in your `config.toml` file, the application will use the Kubernetes API to create some volumes allowing some development features:
- Hot reloading for local domino package.
- Use of local frontend image in cluster.
- Use of local rest image in cluster.
- Hot reloading for local pieces repositories code.