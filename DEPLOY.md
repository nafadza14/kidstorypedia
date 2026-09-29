# Deploy ke Vercel (Kidstorypedia v2)

## Konfigurasi
- `vercel.json` — SPA rewrite ke `/index.html`, **kecuali** `/api/*`, `sw.js`, `manifest.webmanifest`, `icons/`.
- `api/ai.ts` — Vercel Serverless Function untuk semua panggilan Gemini. API key **tidak** pernah dikirim ke browser.
- Build: `npm run build` → output `dist` (Framework preset: Vite).

## Environment variables (Vercel → Project → Settings → Environment Variables)
| Key | Wajib | Keterangan |
|---|---|---|
| `GEMINI_API_KEY` | untuk fitur AI | Server-side saja. **Jangan** pakai prefix `VITE_`. |
| `GEMINI_FAST_MODEL` | opsional | default `gemini-2.5-flash-lite` |
| `GEMINI_STRONG_MODEL` | opsional | default `gemini-2.5-flash` |
| `GEMINI_IMAGE_MODEL` | opsional | default `gemini-2.5-flash-image` |

Catatan: versi lama memakai `VITE_GEMINI_API_KEY` yang ikut ter-bundle ke browser. Hapus variabel itu dari Vercel dan **rotate** key-nya jika pernah dipakai di production.

## Langkah
1. Push ke GitHub.
2. Vercel → Add New → Project → pilih repo `kidstorypedia` (auto-detect Vite).
3. Tambahkan `GEMINI_API_KEY`.
4. Deploy. Tes: buka `/studio/generate` → Generate draft.

## Sebelum public launch
- Set `CONFIG.showStoriesInReview = false` di `src/config.ts` setelah cerita v2 disetujui scholar (lihat `docs/IMPLEMENTATION.md`).
- Hubungkan payment provider (`src/lib/billing.ts`) dan set `CONFIG.paymentsDemoMode = false`.
- Ganti alamat kontak placeholder di halaman Privacy.
