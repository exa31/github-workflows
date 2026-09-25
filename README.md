# GitHub Workflows

Reusable workflows untuk deploy service ke Kubernetes dan Mobile App Stores.

Repo: `exa31/github-workflows`  
Branch: `main`

---

## Daftar Workflow

| Workflow | File | Deskripsi |
|---|---|---|
| Backend | `.github/workflows/backend.yml` | Build Docker + deploy backend ke K8s |
| Frontend | `.github/workflows/frontend.yml` | Build Docker + deploy frontend ke K8s |
| Flutter Android | `.github/workflows/flutter-android.yml` | Build APK/AAB + deploy ke Google Play Console |
| Flutter iOS | `.github/workflows/flutter-ios.yml` | Build IPA + deploy ke Apple TestFlight / App Store |

---

## Permissions pada Caller Workflow

Setiap workflow pemanggil **wajib menyertakan blok `permissions:`** di level root file `.yml` agar fitur seperti Semantic Release, GitHub Release, pembuatan Git Tag, dan update versi `pubspec.yaml` dapat berjalan tanpa error `403 Resource not accessible by integration`:

```yaml
permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write
```

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

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

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

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

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

## Flutter Android

Workflow ini otomatis melakukan setup Java, Flutter, decode keystore `.jks`, generate `android/key.properties`, build `.aab` / `.apk`, upload ke GitHub Artifacts, serta deploy ke **Google Play Console**.

### Inputs

| Input | Required | Default | Deskripsi |
|---|---|---|---|
| `app_name` | ✅ | - | Nama aplikasi mobile (misal: `cyber-mobile`) |
| `flutter_version` | ❌ | `3.x` | Versi Flutter SDK (`3.x`, `3.24.x`, atau `stable`) |
| `java_version` | ❌ | `17` | Versi Java JDK (`17` atau `21`) |
| `build_type` | ❌ | `appbundle` | Tipe build: `appbundle`, `apk`, atau `both` |
| `enable_semantic_release` | ❌ | `true` | Otomatis hitung semver, buat Git Tag, dan GitHub Release |
| `update_pubspec` | ❌ | `true` | Otomatis update baris versi di `pubspec.yaml` & push commit |
| `build_name` | ❌ | - | Override manual versi (misal: `1.0.0`) jika tidak ingin auto |
| `build_number` | ❌ | - | Override integer Version Code. Default: `github.run_number` |
| `build_args` | ❌ | `""` | Argumen tambahan (misal: `--dart-define=ENV=prod`) |
| `package_name` | ❌ | `""` | Package name Android (wajib jika upload Play Store) |
| `upload_to_play_store` | ❌ | `true` | Upload ke Google Play Console |
| `track` | ❌ | `internal` | Track Play Store (`internal`, `alpha`, `beta`, `production`) |
| `status` | ❌ | `completed` | Status rilis (`completed`, `draft`, `inProgress`) |

### Secrets

| Secret | Required | Deskripsi |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | ✅ | Keystore `.jks` di-encode ke format base64 |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ | Password keystore |
| `ANDROID_KEY_ALIAS` | ✅ | Nama alias key |
| `ANDROID_KEY_PASSWORD` | ✅ | Password key alias |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | ❌ | Isi Service Account JSON dari Google Play Console |

### Cara Pakai

```yaml
name: Deploy Android (Flutter)

on:
  push:
    branches:
      - main

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

jobs:
  deploy-android:
    uses: exa31/github-workflows/.github/workflows/flutter-android.yml@main
    with:
      app_name: cyber-mobile
      flutter_version: 3.x
      package_name: com.exa.cybermobile
      build_type: appbundle
      track: internal
      upload_to_play_store: true
    secrets:
      ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
      ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
      ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
      ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      PLAY_STORE_SERVICE_ACCOUNT_JSON: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
```

---

## Flutter iOS

Workflow ini berjalan di runner **macOS** (`macos-latest`), mengimpor Apple Distribution Certificate `.p12` ke temporary keychain, memasang Provisioning Profile, build `.ipa`, upload ke GitHub Artifacts, serta deploy ke **Apple TestFlight / App Store**.

### Inputs

| Input | Required | Default | Deskripsi |
|---|---|---|---|
| `app_name` | ✅ | - | Nama aplikasi mobile (misal: `cyber-mobile`) |
| `flutter_version` | ❌ | `3.x` | Versi Flutter SDK (`3.x`, `3.24.x`, atau `stable`) |
| `enable_semantic_release` | ❌ | `true` | Otomatis hitung semver, buat Git Tag, dan GitHub Release |
| `update_pubspec` | ❌ | `true` | Otomatis update baris versi di `pubspec.yaml` & push commit |
| `build_name` | ❌ | - | Override manual versi (misal: `1.0.0`) jika tidak ingin auto |
| `build_number` | ❌ | - | Override integer Build Number. Default: `github.run_number` |
| `build_args` | ❌ | `""` | Argumen tambahan `flutter build ipa` |
| `upload_to_testflight` | ❌ | `true` | Upload ke TestFlight |
| `uses_non_exempt_encryption` | ❌ | `false` | Set `ITSAppUsesNonExemptEncryption` di `Info.plist` (hilangkan warning Missing Compliance) |
| `runs_on` | ❌ | `macos-latest` | Runner OS (`macos-latest`, `macos-14`, atau self-hosted) |

### Secrets

| Secret | Required | Deskripsi |
|---|---|---|
| `APPLE_CERTIFICATE_BASE64` | ✅ | Sertifikat distribusi `.p12` di-encode base64 |
| `APPLE_CERTIFICATE_PASSWORD` | ✅ | Password sertifikat `.p12` |
| `APPLE_PROVISIONING_PROFILE_BASE64` | ✅ | File `.mobileprovision` di-encode base64 |
| `APP_STORE_CONNECT_API_KEY_BASE64` | ❌ | Private Key App Store Connect (`AuthKey_XXXX.p8`) |
| `APP_STORE_CONNECT_KEY_ID` | ❌ | Key ID 10 karakter dari App Store Connect |
| `APP_STORE_CONNECT_ISSUER_ID` | ❌ | Issuer ID (UUID) dari App Store Connect |

### Cara Pakai

```yaml
name: Deploy iOS (Flutter)

on:
  push:
    branches:
      - main

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

jobs:
  deploy-ios:
    uses: exa31/github-workflows/.github/workflows/flutter-ios.yml@main
    with:
      app_name: cyber-mobile
      flutter_version: 3.x
      upload_to_testflight: true
      uses_non_exempt_encryption: false
    secrets:
      APPLE_CERTIFICATE_BASE64: ${{ secrets.APPLE_CERTIFICATE_BASE64 }}
      APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
      APPLE_PROVISIONING_PROFILE_BASE64: ${{ secrets.APPLE_PROVISIONING_PROFILE_BASE64 }}
      APP_STORE_CONNECT_API_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_API_KEY_BASE64 }}
      APP_STORE_CONNECT_KEY_ID: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
      APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
```

---

## Panduan Encode Secrets Mobile ke Base64

Jalankan perintah ini di terminal Mac / Linux untuk mendapatkan string base64 untuk GitHub Secrets:

### 1. Android Keystore
```bash
# macOS (langsung copy ke clipboard)
base64 -i upload-keystore.jks | pbcopy

# Linux
base64 -w 0 upload-keystore.jks
```

### 2. Apple iOS Certificate (.p12)
```bash
# macOS
base64 -i Certificates.p12 | pbcopy
```

### 3. Apple Provisioning Profile (.mobileprovision)
```bash
# macOS
base64 -i profile.mobileprovision | pbcopy
```

### 4. App Store Connect API Key (.p8)
```bash
# macOS
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

---

## Setup Secrets di Repo Tujuan

Buka **Settings > Secrets and variables > Actions** di repositori tujuan:

### Untuk Backend & Frontend:
- `GHCR_TOKEN` — Personal Access Token dengan scope `write:packages`
- `SSH_KEY` — Private key SSH (bisa pake `deploy` user)
- `VPS_HOST` — IP/domain VPS (contoh: `103.xxx.xxx.xxx`)

### Untuk Flutter Android:
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `PLAY_STORE_SERVICE_ACCOUNT_JSON`

### Untuk Flutter iOS:
- `APPLE_CERTIFICATE_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_PROVISIONING_PROFILE_BASE64`
- `APP_STORE_CONNECT_API_KEY_BASE64`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`
