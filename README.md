# GitHub Workflows

Reusable workflows untuk deploy service ke Kubernetes.

Repo: `exa31/github-workflows`
Branch: `main`

---

## Daftar Workflow

| Workflow | File | Deskripsi |
|---|---|---|
| Backend | `.github/workflows/backend.yml` | Build Docker + deploy backend ke K8s |
| Frontend | `.github/workflows/frontend.yml` | Build Docker + deploy frontend ke K8s |

---

## Backend

### Inputs

| Input | Required | Default | Deskripsi |
|---|---|---|---|
| `app_name` | ✅ | - | Nama deployment & container |
| `namespace` | ✅ | - | Namespace Kubernetes |
| `image_name` | ✅ | - | Nama image di GHCR |
| `docker_context` | ❌ | `.` | Docker build context |
| `dockerfile` | ❌ | `Dockerfile` | Path Dockerfile |
| `ssh_port` | ❌ | `22` | Port SSH server |
| `kubeconfig` | ❌ | `/home/deploy/.kube/config` | Path kubeconfig di server |
| `rollout_timeout` | ❌ | `180s` | Timeout rollout K8s |
| `build_args` | ❌ | `""` | Build args Docker |
| `push_latest` | ❌ | `true` | Push tag `latest` |

### Secrets

| Secret | Required | Deskripsi |
|---|---|---|
| `GHCR_TOKEN` | ✅ | Token GitHub Container Registry |
| `SSH_KEY` | ✅ | Private key SSH |
| `VPS_HOST` | ✅ | Host VPS tujuan |

### Cara Pakai

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

---

## Frontend

### Inputs

| Input | Required | Default | Deskripsi |
|---|---|---|---|
| `app_name` | ✅ | - | Nama deployment & container |
| `image_name` | ✅ | - | Nama image di GHCR |
| `namespace` | ✅ | - | Namespace Kubernetes |
| `docker_context` | ❌ | `.` | Docker build context |
| `dockerfile` | ❌ | `Dockerfile` | Path Dockerfile |
| `node_version` | ❌ | `22` | Versi Node.js |
| `ssh_port` | ❌ | `22` | Port SSH server |
| `kubeconfig` | ❌ | `/home/deploy/.kube/config` | Path kubeconfig di server |
| `rollout_timeout` | ❌ | `180s` | Timeout rollout K8s |
| `build_args` | ❌ | `""` | Build args Docker |
| `push_latest` | ❌ | `true` | Push tag `latest` |

### Secrets

| Secret | Required | Deskripsi |
|---|---|---|
| `GHCR_TOKEN` | ✅ | Token GitHub Container Registry |
| `SSH_KEY` | ✅ | Private key SSH |
| `VPS_HOST` | ✅ | Host VPS tujuan |

### Cara Pakai

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

---

## Setup Secrets di Repo Tujuan

Buka Settings > Secrets and variables > Actions, tambahin:

- `GHCR_TOKEN` — Personal Access Token dengan scope `write:packages`
- `SSH_KEY` — Private key SSH (bisa pake `deploy` user)
- `VPS_HOST` — IP/domain VPS (contoh: `103.xxx.xxx.xxx`)
