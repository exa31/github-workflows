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

## Contoh Flutter Android (Lengkap)

```yaml
name: Deploy Flutter Android

on:
  push:
    branches:
      - main

jobs:
  deploy-android:
    uses: exa31/github-workflows/.github/workflows/flutter-android.yml@main
    with:
      app_name: cyber-mobile
      flutter_version: "3.x"
      java_version: "17"
      build_type: "appbundle"
      package_name: "com.exa.cybermobile"
      track: "internal"
      status: "completed"
      upload_to_play_store: true
    secrets:
      ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
      ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
      ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
      ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      PLAY_STORE_SERVICE_ACCOUNT_JSON: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
```

## Contoh Flutter iOS (Lengkap)

```yaml
name: Deploy Flutter iOS

on:
  push:
    branches:
      - main

jobs:
  deploy-ios:
    uses: exa31/github-workflows/.github/workflows/flutter-ios.yml@main
    with:
      app_name: cyber-mobile
      flutter_version: "3.x"
      upload_to_testflight: true
    secrets:
      APPLE_CERTIFICATE_BASE64: ${{ secrets.APPLE_CERTIFICATE_BASE64 }}
      APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
      APPLE_PROVISIONING_PROFILE_BASE64: ${{ secrets.APPLE_PROVISIONING_PROFILE_BASE64 }}
      APP_STORE_CONNECT_API_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_API_KEY_BASE64 }}
      APP_STORE_CONNECT_KEY_ID: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
      APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
```

