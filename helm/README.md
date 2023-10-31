# Install Domino helm chart 
Add the Domino helm repo:
```bash
helm repo add domino https://tauffer-consulting.github.io/domino/
``` 

Install the Domino helm chart:
```bash
helm install domino domino/domino --dependency-update
```

# Other useful commands
Install dependencies (airflow):
```bash
helm dependency update
```

Install local helm chart:
```bash
helm install domino /helm/domino --dependency-update
```

# Packaging the chart
From `charts/domino`:
```bash
helm package .
```