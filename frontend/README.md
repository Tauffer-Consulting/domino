# Domino Frontend
# A GUI for creating workflows.
### Recommended

This config allow you to ensure code style every time you save a file in frontend folder,
alternatively you can just run the command `yarn lint:fix`

- [ESlint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - Add to settings.json ([Ctrl + Shift + P] to open 'Open Settings (JSON)')
    ```json
      {
      ...
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true,
          "source.fixAll.prettier": true
        },
        "eslint.validate": [
          "javascript",
          "typescript",
          "javascriptreact",
          "typescriptreact"
        ]
      ...
      }
    ```

### How to Run

#### Install dependencies

```bash
yarn install
```

#### Run the application
Running Domino frontend locally:
```bash
yarn start
```

### Build  image

```bash
DOCKER_BUILDKIT=1 docker build -f ./Dockerfile.prod -t domino-frontend .
```

### [Project Structure](./docs/project-structure.md)
