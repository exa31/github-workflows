# 🔐 Panduan Setup Secrets & Variables (Semua Workflow)

Dokumentasi terpadu untuk setup seluruh GitHub Secrets & Variables yang digunakan di repositori `exa31/github-workflows`.

---

## 🧭 Daftar Panduan Khusus Platform

Untuk tutorial langkah demi langkah yang sangat mendalam beserta tangkapan layar, pembuatan sertifikat, dan troubleshooting:

- 🍏 **[Panduan Lengkap Setup Secrets iOS (Apple & TestFlight)](./SECRETS_SETUP_IOS.md)**  
  *CSR Mac, Apple Distribution `.p12`, Provisioning Profile `.mobileprovision`, App Store Connect API Key `.p8`, dan TestFlight deploy.*
- 🤖 **[Panduan Lengkap Setup Secrets Android (Flutter & Play Store)](./SECRETS_SETUP_ANDROID.md)**  
  *Generate Keystore via `keytool`, signing config Gradle, Google Play Console Service Account JSON, dan Play Store deploy.*

---

## 📑 Ringkasan Semua Secrets Berdasarkan Kategori

### 1. 🤖 Mobile Android (Flutter)

Workflow: [`flutter-android.yml`](./.github/workflows/flutter-android.yml)

| Nama Secret | Wajib? | Format | Deskripsi |
|---|:---:|---|---|
| `ANDROID_KEYSTORE_BASE64` | ✅ Ya | String Base64 | File keystore (`upload-keystore.jks`) di-encode ke Base64 |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ Ya | Plain Text | Password untuk keystore |
| `ANDROID_KEY_ALIAS` | ✅ Ya | Plain Text | Alias key dalam keystore (misal: `upload`) |
| `ANDROID_KEY_PASSWORD` | ✅ Ya | Plain Text | Password untuk key alias |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | ⚠️ Opsional | JSON / Base64 | Service Account JSON dari Google Cloud Console (untuk deploy ke Play Store) |
| `ENV_FILE` | ⚠️ Opsional | Plain Text | Isi file `.env` aplikasi mobile |

---

### 2. 🍏 Mobile iOS (Flutter)

Workflow: [`flutter-ios.yml`](./.github/workflows/flutter-ios.yml)

| Nama Secret | Wajib? | Format | Deskripsi |
|---|:---:|---|---|
| `APPLE_CERTIFICATE_BASE64` | ✅ Ya | String Base64 | Apple Distribution Certificate (`.p12`) di-encode Base64 |
| `APPLE_CERTIFICATE_PASSWORD` | ✅ Ya | Plain Text | Password saat mengekspor file `.p12` dari Mac |
| `APPLE_PROVISIONING_PROFILE_BASE64` | ✅ Ya | String Base64 | Provisioning Profile App Store (`.mobileprovision`) di-encode Base64 |
| `APP_STORE_CONNECT_API_KEY_BASE64` | ⚠️ Opsional | String Base64 / Plain Text | Private key App Store Connect (`AuthKey_XXXXXXXXXX.p8`) |
| `APP_STORE_CONNECT_KEY_ID` | ⚠️ Opsional | Plain Text (10 char) | Key ID 10 karakter dari App Store Connect (misal: `ABC1234XYZ`) |
| `APP_STORE_CONNECT_ISSUER_ID` | ⚠️ Opsional | Plain Text (UUID) | Issuer ID UUID dari App Store Connect |
| `ENV_FILE` | ⚠️ Opsional | Plain Text | Isi file `.env` aplikasi mobile |

---

### 3. 🌐 Server, Backend & Frontend (Kubernetes / Docker)

Workflow: [`backend.yml`](./.github/workflows/backend.yml) dan [`frontend.yml`](./.github/workflows/frontend.yml)

| Nama Secret | Wajib? | Format | Deskripsi |
|---|:---:|---|---|
| `GHCR_TOKEN` | ✅ Ya | Plain Text | GitHub Personal Access Token (PAT) dengan scope `write:packages` untuk push image ke GitHub Container Registry. |
| `SSH_KEY` | ✅ Ya | Plain Text | Private SSH key (misal `id_rsa` / `id_ed25519`) untuk remote rollout Kubernetes di VPS. |
| `VPS_HOST` | ✅ Ya | Plain Text | Alamat IP atau hostname VPS server tujuan deploy (misal: `103.xxx.xxx.xxx`). |

---

## ⚡ Cheatsheet Perintah Base64 (Semua OS)

### 🍏 macOS (Langsung copy ke Clipboard)

```bash
# Android Keystore:
base64 -i upload-keystore.jks | pbcopy

# iOS Certificate (.p12):
base64 -i Certificates.p12 | pbcopy

# iOS Provisioning Profile (.mobileprovision):
base64 -i MyApp.mobileprovision | pbcopy

# App Store Connect API Key (.p8):
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

### 🐧 Linux (Ubuntu / Debian / Server)
> ⚠️ Gunakan `-w 0` untuk menghindari karakter baris baru (newline) otomatis di Linux!

```bash
# Android Keystore:
base64 -w 0 upload-keystore.jks > keystore_base64.txt

# iOS Certificate (.p12):
base64 -w 0 Certificates.p12 > cert_base64.txt

# iOS Provisioning Profile (.mobileprovision):
base64 -w 0 MyApp.mobileprovision > profile_base64.txt

# App Store Connect API Key (.p8):
base64 -w 0 AuthKey_XXXXXXXXXX.p8 > p8_base64.txt
```

### 🪟 Windows (PowerShell)

```powershell
# Android Keystore:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-keystore.jks")) | Set-Clipboard

# iOS Certificate (.p12):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Certificates.p12")) | Set-Clipboard

# iOS Provisioning Profile (.mobileprovision):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("MyApp.mobileprovision")) | Set-Clipboard

# App Store Connect API Key (.p8):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8")) | Set-Clipboard
```

---

## 🔁 Cara Singkat Mendaftarkan Secrets ke Repositori

### Metode 1: Lewat Web GitHub (Manual)
1. Buka Repositori Anda di GitHub.
2. Klik **Settings** > **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret**.
4. Masukkan nama secret dan nilainya, lalu klik **Add secret**.

### Metode 2: Sekali Perintah Menggunakan `sync.js` (Otomatis)
Jika Anda memiliki banyak repositori atau ingin menyamakan secrets secara cepat:
1. Buat file `.env` lokal:
   ```bash
   cp .env.example .env
   ```
2. Isi semua nilai secrets di file `.env`.
3. Buka [`sync.js`](./sync.js):
   - Masukkan URL repositori tujuan di `REPOSITORIES_SECRETS`
   - Buka tanda komentar (`//`) pada daftar `SECRETS_TO_SYNC` yang ingin Anda sinkronkan.
4. Jalankan:
   ```bash
   node sync.js
   ```
   *Script akan langsung menghubungkan GitHub CLI (`gh`) dan mengisi seluruh Secrets ke repositori tujuan tanpa perlu klik satu per satu di browser!*
