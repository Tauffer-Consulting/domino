# Domino Frontend
# A GUI for creating workflows.
### Recommended

This config allow you to ensure code style every time you save a file in frontend folder,
alternatively you can just run the command `pnpm run lint:fix`

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
pnpm install
```

#### Run the application
Running Domino frontend locally:
```bash
pnpm start
```

### Build  image

```bash
DOCKER_BUILDKIT=1 docker build -f ./Dockerfile.prod -t domino-frontend .
```

### [Project Structure](./docs/project-structure.md)


### Debug

#### VSCode:

Create a `.vscode` folder in the root project and add a `launch.json` file in it:

```json
{
  "version": "0.2.0",
  "configurations": [
    // Google Chrome configuration
    {
      "type": "chrome",
      "request": "launch",
      "name": "Chrome Debug",
      "userDataDir": false,
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src",
      "enableContentValidation": false,
      "sourceMapPathOverrides": {
          "webpack:///./src/*": "${webRoot}/*"
      },
      "runtimeArgs": [
          "--remote-debugging-port=9222"
      ],
      "sourceMaps": true,
      "pathMapping": {"url": "/src/", "path": "${webRoot}/"}
    },
    // Microsoft Edge configuration
    {
      "type": "msedge",
      "request": "launch",
      "name": "Edge Debug",
      "userDataDir": false,
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src",
      "enableContentValidation": false,
      "sourceMapPathOverrides": {
          "webpack:///./src/*": "${webRoot}/*"
      },
      "runtimeArgs": [
          "--remote-debugging-port=9222"
      ],
      "sourceMaps": true,
      "pathMapping": {"url": "/src/", "path": "${webRoot}/"}
    },
  ]
}
```
