# 🍏 Panduan Lengkap Setup Secrets iOS (Apple & TestFlight)

Panduan langkah demi langkah (step-by-step) untuk membuat, mengekspor, mengubah ke format **Base64**, dan mendaftarkan Secrets iOS ke **GitHub Actions** untuk workflow [`flutter-ios.yml`](./.github/workflows/flutter-ios.yml).

---

## 📋 Daftar Secrets yang Dibutuhkan

Berikut daftar 6 Secrets utama yang digunakan oleh CI/CD iOS:

| Nama Secret | Wajib? | Format / Tipe | Deskripsi Singkat |
|---|:---:|---|---|
| `APPLE_CERTIFICATE_BASE64` | ✅ Ya | String Base64 | Apple Distribution Certificate (`.p12`) di-encode base64 |
| `APPLE_CERTIFICATE_PASSWORD` | ✅ Ya | Plain Text | Password yang dibuat saat export `.p12` |
| `APPLE_PROVISIONING_PROFILE_BASE64` | ✅ Ya | String Base64 | Provisioning Profile App Store (`.mobileprovision`) di-encode base64 |
| `APP_STORE_CONNECT_API_KEY_BASE64` | ⚠️ Opsional | String Base64 / Plain Text | Private key App Store Connect (`AuthKey_XXXX.p8`) |
| `APP_STORE_CONNECT_KEY_ID` | ⚠️ Opsional | Plain Text (10 karakter) | Key ID dari App Store Connect |
| `APP_STORE_CONNECT_ISSUER_ID` | ⚠️ Opsional | Plain Text (UUID) | Issuer ID dari App Store Connect |

> [!NOTE]
> 3 secret App Store Connect bertanda *Opsional* hanya wajib diisi jika Anda mengaktifkan `upload_to_testflight: true`. Jika hanya ingin build IPA dan upload ke GitHub Release / Artifacts, cukup isi 3 secret pertama.

---

## 🛠️ Langkah 1: Apple Distribution Certificate (`.p12`) & Password

Certificate distribusi digunakan oleh Xcode di runner CI/CD untuk menandatangani (code sign) aplikasi binary `.ipa`.

### 1.1 Buat Certificate Signing Request (CSR) di Mac
1. Buka aplikasi **Keychain Access** (Akses Rantai Kunci) di Mac Anda.
2. Di menu bar atas, klik **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority...**
3. Isi form:
   - **User Email Address**: Email Apple ID Anda.
   - **Common Name**: Nama Anda / Perusahaan (contoh: `John Doe Distribution`).
   - **Request is**: Pilih **Saved to disk** (Simpan ke disk).
4. Klik **Continue** dan simpan file `CertificateSigningRequest.certSigningRequest`.

### 1.2 Buat Sertifikat di Apple Developer Portal
1. Masuk ke [developer.apple.com/account](https://developer.apple.com/account).
2. Masuk ke menu **Certificates, Identifiers & Profiles** > **Certificates**.
3. Klik tombol **(+)** untuk membuat sertifikat baru.
4. Pilih tipe: **Apple Distribution** (atau *iOS Distribution (App Store and Ad Hoc)*) lalu klik **Continue**.
5. Upload file `CertificateSigningRequest.certSigningRequest` yang dibuat di langkah 1.1.
6. Klik **Download** untuk mengunduh file sertifikat (misal: `distribution.cer`).

### 1.3 Install dan Export ke File `.p12`
1. Double-click file `distribution.cer` yang baru didownload untuk memasukkannya ke **Keychain Access**.
2. Di Keychain Access:
   - Pilih tab **login** di sidebar kiri.
   - Pilih tab **My Certificates** (Sertifikat Saya).
   - Cari sertifikat yang baru diinstal (biasanya bernama `Apple Distribution: Nama Akun (Team ID)`).
   - Klik panah kiri di samping nama sertifikat untuk memastikan ada **Private Key** di dalamnya.
3. Klik kanan pada sertifikat tersebut > pilih **Export "Apple Distribution: ..."**.
4. Format file: pilih **Personal Information Exchange (.p12)**. Simpan dengan nama misalnya `Certificates.p12`.
5. Masukkan **Password** untuk memproteksi file `.p12` ini. 
   > ⚠️ **Catat password ini!** Ini yang akan menjadi nilai untuk `APPLE_CERTIFICATE_PASSWORD`.
6. Jika Mac meminta password login administrator, masukkan untuk mengizinkan ekspor.

---

## 📄 Langkah 2: Apple Provisioning Profile (`.mobileprovision`)

Provisioning Profile menghubungkan App ID (Bundle Identifier) aplikasi Anda dengan Sertifikat Distribusi.

### 2.1 Daftarkan Identifier (Jika belum ada)
1. Di [Apple Developer Portal](https://developer.apple.com/account), buka menu **Identifiers**.
2. Pastikan Bundle ID aplikasi Anda sudah terdaftar (contoh: `com.example.myapp`).
3. Pastikan Capabilities yang dibutuhkan (Push Notifications, Sign In with Apple, dll.) sudah dicentang.

### 2.2 Buat Profile Distribusi
1. Buka menu **Profiles** > klik tombol **(+)**.
2. Pada bagian **Distribution**, pilih **App Store** lalu klik **Continue**.
3. Pilih **App ID** aplikasi Anda yang sesuai.
4. Pilih **Distribution Certificate** yang dibuat pada Langkah 1.
5. Beri nama profile, misalnya: `MyApp_AppStore_Profile`.
6. Klik **Generate**, lalu klik **Download**. File akan tersimpan dengan ekstensi `.mobileprovision` (misal: `MyApp_AppStore_Profile.mobileprovision`).

---

## 🔑 Langkah 3: App Store Connect API Key (Untuk Deploy ke TestFlight)

API Key memungkinkan GitHub Actions mengupload file `.ipa` langsung ke TestFlight secara otomatis tanpa prompt 2FA SMS / Apple ID.

1. Buka [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. Masuk ke menu **Users and Access** (Pengguna dan Akses).
3. Klik tab **Integrations** (atau **Keys / API Keys**).
4. Klik tombol **(+)** untuk membuat API Key baru:
   - **Name**: Contoh `GitHub Actions CI`.
   - **Access / Role**: Pilih **App Manager** (atau **Admin**).
5. Setelah terbuat, Anda akan melihat baris baru di tabel:
   - **Key ID**: Kumpulan 10 karakter alfanumerik (misal: `ABC1234XYZ`) ➔ Nilai untuk `APP_STORE_CONNECT_KEY_ID`.
   - **Issuer ID**: UUID di bagian atas tabel (misal: `00000000-0000-0000-0000-000000000000`) ➔ Nilai untuk `APP_STORE_CONNECT_ISSUER_ID`.
6. Klik **Download API Key** di samping baris tersebut untuk mengunduh file `AuthKey_XXXXXXXXXX.p8`.
   > ⚠️ **PENTING:** Apple hanya mengizinkan download file `.p8` ini **SATU KALI SAJA**. Simpan file ini di tempat aman!

---

## ⚡ Langkah 4: Cara Encode File ke Base64

File binary (`.p12`, `.mobileprovision`, `.p8`) harus diubah menjadi teks base64 satu baris agar aman disimpan di GitHub Secrets.

### 🍎 Cara di macOS (Terminal):

Jalankan perintah ini di direktori tempat file Anda berada:

```bash
# 1. Certificate (.p12) -> langsung copy ke clipboard
base64 -i Certificates.p12 | pbcopy
# Atau simpan ke file txt:
base64 -i Certificates.p12 -o cert_base64.txt

# 2. Provisioning Profile (.mobileprovision) -> langsung copy ke clipboard
base64 -i MyApp_AppStore_Profile.mobileprovision | pbcopy
# Atau simpan ke file txt:
base64 -i MyApp_AppStore_Profile.mobileprovision -o profile_base64.txt

# 3. App Store Connect API Key (.p8) -> langsung copy ke clipboard
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
# Atau simpan ke file txt:
base64 -i AuthKey_XXXXXXXXXX.p8 -o p8_base64.txt
```

---

### 🐧 Cara di Linux (Ubuntu / Debian):

> ⚠️ Pada Linux, gunakan flag `-w 0` agar base64 tidak dipecah dengan karakter baris baru (newline):

```bash
# 1. Certificate (.p12)
base64 -w 0 Certificates.p12 > cert_base64.txt

# 2. Provisioning Profile (.mobileprovision)
base64 -w 0 MyApp_AppStore_Profile.mobileprovision > profile_base64.txt

# 3. App Store Connect API Key (.p8)
base64 -w 0 AuthKey_XXXXXXXXXX.p8 > p8_base64.txt
```

---

### 🪟 Cara di Windows (PowerShell):

```powershell
# 1. Certificate (.p12)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Certificates.p12")) | Set-Clipboard

# 2. Provisioning Profile (.mobileprovision)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("MyApp_AppStore_Profile.mobileprovision")) | Set-Clipboard

# 3. App Store Connect API Key (.p8)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8")) | Set-Clipboard
```

---

## 🧪 Langkah 5: Cara Verifikasi String Base64 (Opsional tapi Direkomendasikan)

Untuk memastikan hasil encode base64 valid dan tidak corrupt sebelum dimasukkan ke GitHub Secrets:

```bash
# Cek apakah base64 certificate dapat didecode kembali:
echo "ISI_BASE64_CERTIFICATE" | base64 --decode | file -
# Output yang benar: "data" atau "Apple QuickTime / PKCS#12"

# Cek isi provisioning profile:
echo "ISI_BASE64_PROFILE" | base64 --decode | security cms -D -i -
# Output yang benar: File XML plist yang berisi AppID, TeamIdentifier, dll.
```

---

## 🚀 Langkah 6: Daftarkan Secrets ke GitHub Repository

Ada 2 opsi untuk mendaftarkan secrets ke repositori Anda:

### Opsi A: Melalui Web UI GitHub (Manual)
1. Buka repository project Flutter Anda di browser GitHub.
2. Klik tab **Settings** (Pengaturan).
3. Di sidebar kiri, klik **Secrets and variables** > **Actions**.
4. Klik tombol hijau **New repository secret**.
5. Masukkan satu per satu secret berikut:

| Name | Secret Value |
|---|---|
| `APPLE_CERTIFICATE_BASE64` | Paste hasil encode file `.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | Password saat export `.p12` pada Langkah 1.3 |
| `APPLE_PROVISIONING_PROFILE_BASE64` | Paste hasil encode file `.mobileprovision` |
| `APP_STORE_CONNECT_API_KEY_BASE64` | Paste hasil encode file `AuthKey_XXXX.p8` |
| `APP_STORE_CONNECT_KEY_ID` | String Key ID 10 karakter (misal: `ABC1234XYZ`) |
| `APP_STORE_CONNECT_ISSUER_ID` | String UUID Issuer ID (misal: `00000000-0000-0000-0000-000000000000`) |

---

### Opsi B: Otomatis Menggunakan `sync.js` (Rekomendasi jika mengelola banyak repo)

Di repository ini sudah disediakan script otomatisasi [`sync.js`](./sync.js) berbasis GitHub CLI:

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Isi nilai-nilai secret iOS di file `.env`:
   ```ini
   APPLE_CERTIFICATE_BASE64=isi_panjang_base64_p12_disini
   APPLE_CERTIFICATE_PASSWORD=password_p12_anda
   APPLE_PROVISIONING_PROFILE_BASE64=isi_panjang_base64_mobileprovision_disini
   APP_STORE_CONNECT_API_KEY_BASE64=isi_panjang_base64_p8_disini
   APP_STORE_CONNECT_KEY_ID=ABC1234XYZ
   APP_STORE_CONNECT_ISSUER_ID=00000000-0000-0000-0000-000000000000
   ```
3. Edit [`sync.js`](./sync.js), masukkan URL repository project Flutter Anda di `REPOSITORIES_SECRETS` dan aktifkan key secrets iOS di daftar `SECRETS_TO_SYNC`.
4. Jalankan:
   ```bash
   node sync.js
   ```
   *Semua secrets akan ter-push ke GitHub repository tujuan secara instan!*

---

## 📝 Contoh File Workflow Pemanggil (`.github/workflows/deploy-ios.yml`)

Di repository aplikasi Flutter Anda, buat file `.github/workflows/deploy-ios.yml`:

```yaml
name: Deploy iOS to TestFlight

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
  deploy-ios:
    uses: exa31/github-workflows/.github/workflows/flutter-ios.yml@main
    with:
      app_name: my-flutter-app
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

## ❓ FAQ & Troubleshooting Umum

### 1. Error: `MAC verified OK` atau `security: SecKeychainItemImport: The specified item already exists`
- **Penyebab:** Password `.p12` salah atau keychain tidak dapat mengimpor sertifikat.
- **Solusi:** Pastikan `APPLE_CERTIFICATE_PASSWORD` tepat sama dengan password yang dimasukkan saat mengekspor dari Keychain Access Mac.

### 2. Error: `No profile matching 'xxx' found`
- **Penyebab:** Bundle Identifier pada `pubspec.yaml` / `project.pbxproj` tidak cocok dengan App ID yang terdaftar di Provisioning Profile.
- **Solusi:** Samakan `PRODUCT_BUNDLE_IDENTIFIER` di Xcode dengan App ID yang dipilih saat membuat profile di portal Apple Developer.

### 3. Warning TestFlight: `Missing Compliance (ITSAppUsesNonExemptEncryption)`
- **Penyebab:** Apple mengharuskan deklarasi enkripsi untuk setiap binary baru.
- **Solusi:** Workflow ini sudah memiliki input `uses_non_exempt_encryption: false` yang secara otomatis menginjeksi baris tersebut ke `Info.plist` sehingga warning langsung hilang dan build langsung siap ditest di TestFlight!

### 4. Build berhasil terupload tetapi belum muncul di TestFlight
- **Penjelasan:** Setelah upload sukses, Apple membutuhkan waktu **5 - 15 menit** untuk memproses asset binary di server mereka sebelum status berubah menjadi *Ready to Test*.
