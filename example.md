## Contoh Backend (Lengkap)

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - main

jobs:
  deploy:
    uses: exa31/github-workflows/.github/workflows/backend.yml@main
    with:
      app_name: be-wa-gateway-ftracker
      namespace: dev-coffe
      image_name: ghcr.io/exa31/be-wa-gateway-ftracker
      docker_context: .
      dockerfile: Dockerfile
      ssh_port: 31080
      kubeconfig: /home/deploy/.kube/config
      rollout_timeout: 300s
      build_args: |
        NODE_ENV=production
        APP_VERSION=${{ github.sha }}
      push_latest: true
    secrets:
      GHCR_TOKEN: ${{ secrets.GHCR_TOKEN }}
      SSH_KEY: ${{ secrets.SSH_KEY }}
      VPS_HOST: ${{ secrets.VPS_HOST }}
```

## Contoh Frontend (Lengkap)

```yaml
name: Deploy Frontend

on:
  push:
    branches:
      - main

jobs:
  deploy:
    uses: exa31/github-workflows/.github/workflows/frontend.yml@main
    with:
      app_name: fe-web-dashboard
      namespace: dev-coffe
      image_name: ghcr.io/exa31/fe-web-dashboard
      docker_context: .
      dockerfile: Dockerfile
      node_version: "22"
      ssh_port: 31080
      kubeconfig: /home/deploy/.kube/config
      rollout_timeout: 300s
      build_args: |
        VITE_API_URL=https://api.example.com
        VITE_APP_VERSION=${{ github.sha }}
      push_latest: true
    secrets:
      GHCR_TOKEN: ${{ secrets.GHCR_TOKEN }}
      SSH_KEY: ${{ secrets.SSH_KEY }}
      VPS_HOST: ${{ secrets.VPS_HOST }}
```
