# 🤖 Panduan Lengkap Setup Secrets Android (Flutter & Google Play)

Panduan langkah demi langkah (step-by-step) untuk membuat Keystore, mengekspor ke format **Base64**, membuat Service Account Google Play Console, dan mendaftarkan Secrets ke **GitHub Actions** untuk workflow [`flutter-android.yml`](./.github/workflows/flutter-android.yml).

---

## 📋 Daftar Secrets yang Dibutuhkan

Berikut daftar Secrets yang digunakan oleh CI/CD Android:

| Nama Secret | Wajib? | Format / Tipe | Deskripsi Singkat |
|---|:---:|---|---|
| `ANDROID_KEYSTORE_BASE64` | ✅ Ya | String Base64 | File keystore (`upload-keystore.jks`) di-encode ke Base64 |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ Ya | Plain Text | Password untuk file keystore |
| `ANDROID_KEY_ALIAS` | ✅ Ya | Plain Text | Nama alias key di dalam keystore (contoh: `upload`) |
| `ANDROID_KEY_PASSWORD` | ✅ Ya | Plain Text | Password untuk key alias |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | ⚠️ Opsional* | JSON / Base64 | Service Account JSON key dari Google Cloud untuk deploy ke Play Store |
| `ENV_FILE` | ⚠️ Opsional | Plain Text | Isi file `.env` aplikasi jika menggunakan environment secret |

> [!NOTE]
> `PLAY_STORE_SERVICE_ACCOUNT_JSON` hanya wajib diisi jika Anda mengaktifkan input `upload_to_play_store: true`. Jika hanya ingin build APK / AAB dan di-upload ke GitHub Releases / Artifacts, cukup isi 4 secret keystore pertama.

---

## 🛠️ Langkah 1: Buat Upload Keystore (`.jks`)

Untuk menandatangani aplikasi Android (Release build), Anda membutuhkan file Java Keystore (`.jks`).

### 1.1 Generate Keystore menggunakan `keytool`

Jalankan perintah ini di Terminal (Mac/Linux) atau Command Prompt / PowerShell (Windows):

```bash
keytool -genkey -v \
  -keystore upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storetype JKS
```

> [!TIP]
> Jika `keytool` tidak ditemukan:
> - **macOS:** Biasanya ada di path JDK bawaan Android Studio: `/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool`
> - **Windows:** `C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe`

### 1.2 Isi Pertanyaan saat Pembuatan:
1. **Enter keystore password:** Masukkan password keystore Anda (catat untuk `ANDROID_KEYSTORE_PASSWORD`).
2. **Re-enter new password:** Masukkan ulang password yang sama.
3. Pertanyaan identitas (Nama, Unit, Organisasi, Kota, Provinsi, Kode Negara `ID`).
4. Konfirmasi dengan mengetik `yes` lalu tekan Enter.
5. **Enter key password for <upload>:** Tekan Enter langsung jika ingin sama dengan password keystore, atau buat password khusus (catat untuk `ANDROID_KEY_PASSWORD`).

Setelah selesai, Anda akan memiliki file bernama **`upload-keystore.jks`**.
- **Key Alias**: `upload` (nilai untuk `ANDROID_KEY_ALIAS`)
- **Keystore Password**: password yang Anda buat (nilai untuk `ANDROID_KEYSTORE_PASSWORD`)
- **Key Password**: password key yang Anda buat (nilai untuk `ANDROID_KEY_PASSWORD`)

> ⚠️ **PENTING:** Simpan file `upload-keystore.jks` ini di tempat yang aman (misalnya di password manager/cloud storage pribadi). Jika file ini hilang, Anda tidak akan bisa mengupdate aplikasi yang sudah rilis di Google Play Store!

---

## ⚙️ Langkah 2: Konfigurasi `build.gradle` di Project Flutter Anda

Agar runner CI/CD mengenali keystore saat build release, pastikan file konfigurasi Android di project Flutter Anda sudah disiapkan:

### 2.1 Cek file `android/app/build.gradle` (atau `build.gradle.kts`)

Tambahkan konfigurasi signing release menggunakan `key.properties`:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias = keystoreProperties['keyAlias']
            keyPassword = keystoreProperties['keyPassword']
            storeFile = keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword = keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.release
            ...
        }
    }
}
```

> 💡 **Info:** Workflow CI/CD [`flutter-android.yml`](./.github/workflows/flutter-android.yml) secara otomatis mendecode file keystore ke `android/app/upload-keystore.jks` dan membuat file `android/key.properties` secara otomatis on-the-fly dari secrets GitHub Actions.

---

## ⚡ Langkah 3: Cara Encode Keystore ke Base64

File binary `upload-keystore.jks` harus diubah menjadi string Base64 satu baris agar dapat disimpan sebagai text secret di GitHub.

### 🍎 Di macOS:
```bash
# Langsung copy string base64 ke clipboard:
base64 -i upload-keystore.jks | pbcopy

# Atau simpan ke file teks:
base64 -i upload-keystore.jks -o keystore_base64.txt
```

### 🐧 Di Linux (Ubuntu / Debian):
> ⚠️ Gunakan flag `-w 0` agar base64 tidak memiliki baris baru (newline):
```bash
base64 -w 0 upload-keystore.jks > keystore_base64.txt
```

### 🪟 Di Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-keystore.jks")) | Set-Clipboard
```

---

## 🛍️ Langkah 4: Setup Google Play Service Account (Deploy Otomatis ke Play Store)

Jika ingin aplikasi otomatis ter-upload ke Google Play Console (Internal App Sharing, Closed Track Alpha/Beta, atau Production), Anda memerlukan **Google Play Developer API Service Account JSON**.

### 4.1 Buka Google Play Console & API Access
1. Masuk ke [Google Play Console](https://play.google.com/console).
2. Di menu navigasi samping, scroll ke bawah ke bagian **Setup** (Penyiapan) > pilih **API access** (Akses API).
3. Jika belum ditautkan ke Google Cloud Project, klik **Link Google Cloud project** atau **Create new Google Cloud project**.

### 4.2 Buat Service Account di Google Cloud Console
1. Pada halaman **API access**, klik tombol **View in Google Cloud Console** (atau buka [console.cloud.google.com](https://console.cloud.google.com)).
2. Masuk ke menu **IAM & Admin** > **Service Accounts**.
3. Klik **+ CREATE SERVICE ACCOUNT** di bagian atas:
   - **Service account name**: misal `github-actions-deployer`
   - **Service account ID**: biarkan terisi otomatis
   - Klik **CREATE AND CONTINUE**
4. Pada step **Grant this service account access to project**, pilih Role:
   - Pilih **Basic** > **Editor** (atau *Service Account User*)
   - Klik **CONTINUE** > klik **DONE**.

### 4.3 Download JSON Key
1. Pada tabel Service Accounts, klik email service account yang baru dibuat (misal `github-actions-deployer@...`).
2. Masuk ke tab **KEYS** (Kunci).
3. Klik **ADD KEY** > **Create new key**.
4. Pilih tipe kunci **JSON**, lalu klik **CREATE**.
5. Browser akan otomatis mengunduh file `.json` (misal: `pc-api-xxxx-xxxx.json`).

> ⚠️ Simpan file JSON ini baik-baik. Jangan pernah commit file JSON ini ke git repository!

### 4.4 Beri Izin Service Account di Google Play Console
1. Kembali ke tab browser **Google Play Console** > **API access**.
2. Scroll ke bagian **Service accounts**. Anda akan melihat email service account yang baru dibuat.
3. Klik tombol **Manage Play Console permissions** (Kelola izin Play Console) di samping email tersebut.
4. Di tab **App permissions**:
   - Pilih aplikasi Flutter Anda (atau beri akses ke semua aplikasi).
5. Di tab **Account permissions**:
   - Centang izin yang diperlukan untuk rilis:
     - **Releases**: *Create, edit, and delete draft apps*, *Release to production, exclude devices, and use Play App Signing*, *Release apps to testing tracks*.
6. Klik tombol **Invite user** / **Save changes** di pojok kanan bawah.

---

## 🚀 Langkah 5: Daftarkan Secrets ke GitHub Repository

### Opsi A: Melalui Web UI GitHub
1. Buka repositori project Flutter Anda di GitHub.
2. Masuk ke **Settings** > **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret**, tambahkan satu per satu:

| Nama Secret | Nilai Secret |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Hasil string Base64 dari file `upload-keystore.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Password keystore Anda |
| `ANDROID_KEY_ALIAS` | Nama alias (misal: `upload`) |
| `ANDROID_KEY_PASSWORD` | Password key alias Anda |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Seluruh isi teks file `.json` dari Google Cloud *(bisa juga di-encode base64)* |

---

### Opsi B: Otomatis Menggunakan `sync.js`

Gunakan script [`sync.js`](./sync.js) yang ada di template ini:

1. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Isi nilai secret di file `.env`:
   ```ini
   ANDROID_KEYSTORE_BASE64=isi_base64_upload_keystore_jks_disini
   ANDROID_KEYSTORE_PASSWORD=password_keystore_anda
   ANDROID_KEY_ALIAS=upload
   ANDROID_KEY_PASSWORD=password_key_anda
   PLAY_STORE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
   ```
3. Di file [`sync.js`](./sync.js), aktifkan secret Android pada array `SECRETS_TO_SYNC`.
4. Jalankan:
   ```bash
   node sync.js
   ```

---

## 📝 Contoh Caller Workflow (`.github/workflows/deploy-android.yml`)

Di repository aplikasi Flutter Anda, panggil reusable workflow ini:

```yaml
name: Deploy Android (Flutter)

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

jobs:
  deploy-android:
    uses: exa31/github-workflows/.github/workflows/flutter-android.yml@main
    with:
      app_name: my-flutter-app
      flutter_version: 3.x
      build_type: both              # 'apk', 'appbundle', atau 'both'
      attach_to_release: true       # Upload file APK/AAB ke GitHub Releases
      upload_to_play_store: true    # Upload ke Google Play Console
      package_name: com.example.myapp
      track: internal               # internal, alpha, beta, atau production
      status: completed             # completed atau draft
    secrets:
      ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
      ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
      ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
      ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      PLAY_STORE_SERVICE_ACCOUNT_JSON: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
```

---

## ❓ FAQ & Troubleshooting Android

### 1. Error: `Keystore was tampered with, or password was incorrect`
- **Penyebab:** Password `ANDROID_KEYSTORE_PASSWORD` salah atau proses decode Base64 menghasilkan file corrupt (misal karena ada enter/newline terpotong).
- **Solusi:** Di Linux/macOS, pastikan encode base64 tanpa baris baru. Verifikasi dengan:
  ```bash
  echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode | keytool -list -v
  ```

### 2. Error Google Play: `Google Play Android Developer API has not been used in project ... before or it is disabled`
- **Penyebab:** API belum diaktifkan di Google Cloud Console.
- **Solusi:** Buka URL aktivasi yang muncul pada log error GitHub Actions atau cari **Google Play Android Developer API** di Google Cloud Console lalu klik **Enable**.

### 3. Error Google Play: `Changes cannot be sent for review until the app has been published manually`
- **Penyebab:** Google Play Store mensyaratkan **rilis pertama (First Release)** harus di-upload manual melalui website Google Play Console untuk menetapkan App Signing.
- **Solusi:** Build AAB sekali melalui CI, unduh file `.aab` dari GitHub Releases atau Artifacts, lalu upload secara manual sekali saja ke Play Console. Rilis-rilis berikutnya dapat berjalan otomatis 100% via GitHub Actions!
