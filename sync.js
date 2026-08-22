const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Deteksi otomatis lokasi GitHub CLI di Windows
const GH_CMD = fs.existsSync("C:\\Program Files\\GitHub CLI\\gh.exe")
  ? '"C:\\Program Files\\GitHub CLI\\gh.exe"'
  : "gh";

// =========================================================================
// 1. KONFIGURASI DAFTAR REPOSITORI
// =========================================================================

// Daftar repo yang membutuhkan SECRETS (Misal: Backend / App yang butuh deploy ke server)
const REPOSITORIES_SECRETS = ["https://github.com/exa-dev-coffe/worker-asynq"];

// Daftar repo yang membutuhkan VARIABLES (Misal: Frontend yang butuh setting tema/API URL)
const REPOSITORIES_VARS = [
  // "https://github.com/exa31/fe-chat-app"
];

// =========================================================================
// 2. TENTUKAN NAMA SECRET & VARIABLE YANG MAU DI-SYNC
// =========================================================================
const SECRETS_TO_SYNC = ["SSH_KEY", "VPS_HOST", "GHCR_TOKEN"];
const VARS_TO_SYNC = [
  // "VITE_WS_URL",
  // "VITE_APP_API_URL",
  // "VITE_GOOGLE_CLIENT_ID",
];

// =========================================================================
// Script Utama (Tidak perlu diubah)
// =========================================================================
console.log("🚀 Membaca file .env...");
const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  console.error("❌ File .env tidak ditemukan!");
  console.error(
    "💡 Silakan copy file .env.example menjadi .env lalu isi nilainya.",
  );
  process.exit(1);
}

// Parser .env dengan dukungan multiline (penting untuk SSH_KEY)
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

let isMultiline = false;
let currentKey = null;
let currentVal = "";

envContent.split(/\r?\n/).forEach((line) => {
  if (isMultiline) {
    // Jika kita sedang di dalam string multiline (quotes)
    if (line.endsWith('"')) {
      currentVal += "\n" + line.slice(0, -1);
      envVars[currentKey] = currentVal.replace(/\\n/g, "\n");
      isMultiline = false;
    } else {
      currentVal += "\n" + line;
    }
  } else {
    // Mencari format KEY=VALUE
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      let val = match[2];

      if (val.startsWith('"') && !val.endsWith('"')) {
        // Awal dari multiline string
        isMultiline = true;
        currentVal = val.slice(1);
      } else if (val.startsWith('"') && val.endsWith('"')) {
        // String satu baris pakai double quotes
        envVars[currentKey] = val.slice(1, -1).replace(/\\n/g, "\n");
      } else if (val.startsWith("'") && val.endsWith("'")) {
        // String satu baris pakai single quotes
        envVars[currentKey] = val.slice(1, -1).replace(/\\n/g, "\n");
      } else {
        // Tanpa quotes
        envVars[currentKey] = val;
      }
    }
  }
});

// ---------------------------------------------------------
// PROSES 1: SYNC SECRETS
// ---------------------------------------------------------
console.log(`\n======================================================`);
console.log(
  `🔒 MEMULAI SINKRONISASI SECRETS KE ${REPOSITORIES_SECRETS.length} REPO...`,
);
console.log(`======================================================\n`);

for (let repo of REPOSITORIES_SECRETS) {
  repo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  console.log(`📦 Repositori (Secret): ${repo}`);

  for (const key of SECRETS_TO_SYNC) {
    if (envVars[key]) {
      console.log(`   🔑 Menset Secret: ${key}`);
      try {
        execSync(`${GH_CMD} secret set ${key} --repo "${repo}"`, {
          input: envVars[key],
          stdio: ["pipe", "inherit", "inherit"],
          encoding: "utf8",
        });
      } catch (err) {
        console.error(`   ❌ Gagal set secret ${key}`);
      }
    } else {
      console.log(`   ⚠️ Lewati Secret: ${key} (tidak ada di .env)`);
    }
  }
  console.log("   ✅ Selesai.\n");
}

// ---------------------------------------------------------
// PROSES 2: SYNC VARIABLES
// ---------------------------------------------------------
console.log(`\n======================================================`);
console.log(
  `📝 MEMULAI SINKRONISASI VARIABLES KE ${REPOSITORIES_VARS.length} REPO...`,
);
console.log(`======================================================\n`);

for (let repo of REPOSITORIES_VARS) {
  repo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  console.log(`📦 Repositori (Variable): ${repo}`);

  for (const key of VARS_TO_SYNC) {
    if (envVars[key]) {
      console.log(`   📝 Menset Variable: ${key}`);
      try {
        execSync(`${GH_CMD} variable set ${key} --repo "${repo}"`, {
          input: envVars[key],
          stdio: ["pipe", "inherit", "inherit"],
          encoding: "utf8",
        });
      } catch (err) {
        console.error(`   ❌ Gagal set variable ${key}`);
      }
    } else {
      console.log(`   ⚠️ Lewati Variable: ${key} (tidak ada di .env)`);
    }
  }
  console.log("   ✅ Selesai.\n");
}

console.log("🎉 Semua proses sinkronisasi berhasil!");
