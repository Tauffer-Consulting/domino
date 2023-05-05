# Install Domino helm chart
```
helm install domino domino-0.1.0
```

# Step-by-step modifying the values.yaml file
Add the Domino helm repo:
```bash
helm repo add domino https://tauffer-consulting.github.io/domino/
``` 

Install dependencies (airflow):
```bash
helm dependency update
```

Install local helm chart:
```bash
helm install domino ./domino-0.1.0.tgz -f values.yaml
```

# Packaging the chart
From `charts/domino`:
```bash
helm package .
```