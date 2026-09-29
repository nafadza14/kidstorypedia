# Panduan Deploy ke Vercel (Kidstorypedia)

Project ini telah dikonfigurasi dan 100% siap untuk di-deploy ke **Vercel**.

---

## 1. Konfigurasi yang Telah Diterapkan

1. **`vercel.json`**:
   - Ditambahkan rewrite rule `/(.*) -> /index.html` untuk memastikan semua route SPA React Router (`/`, `/dashboard`, `/child`, `/story/:id`) dapat di-refresh dan diakses langsung tanpa error 404 di Vercel.

2. **`package.json`**:
   - Script build standar Vite: `"build": "vite build"`.
   - Output directory: `dist`.

3. **`vite.config.ts`**:
   - Mendukung environment variable `GEMINI_API_KEY` maupun `VITE_GEMINI_API_KEY`.

---

## 2. Cara Deploy ke Vercel

### Metode A: Via Vercel Dashboard (Rekomendasi)

1. Push repository ini ke GitHub / GitLab / Bitbucket.
2. Buka [vercel.com](https://vercel.com) dan login ke akun Anda.
3. Klik tombol **"Add New..."** > **"Project"**.
4. Pilih repository **kidstorypedia**.
5. Vercel akan otomatis mendeteksi pengaturan:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. *(Opsional)* Pada bagian **Environment Variables**, tambahkan:
   - Key: `GEMINI_API_KEY` (atau `VITE_GEMINI_API_KEY`)
   - Value: *(API Key Gemini Anda untuk fitur generator kisah AI)*
7. Klik **"Deploy"**.

---

### Metode B: Via Vercel CLI

Jika Anda menggunakan terminal lokal:

```bash
# 1. Install Vercel CLI (jika belum)
npm install -g vercel

# 2. Login ke akun Vercel
vercel login

# 3. Jalankan perintah deploy
vercel

# 4. Untuk deploy ke production
vercel --prod
```

---

## 3. Catatan Penting
- Semua halaman (Landing Page, Parent Portal, Kids View, Interactive Story Reader) akan langsung aktif dan responsive di URL Vercel (`https://kidstorypedia.vercel.app`).
