# Menyiapkan Google Sheets untuk Log Sertifikat ARIJU-VII

Website memberi nomor ID global (ARIJU-001, ARIJU-002, ...) dari database Netlify,
lalu mengirim **No, ID, Nama, Waktu, Kuis, Skor, Negara** ke Google Sheet Anda secara real-time.

## 1. Buat Spreadsheet & Script
1. Buka https://sheets.new dan beri nama, mis. `ARIJU-VII - Sertifikat`.
2. Menu **Extensions → Apps Script**.
3. Hapus isi `Code.gs`, lalu tempel seluruh isi file [`Code.gs`](./Code.gs) dari folder ini.
4. Ganti nilai `SECRET` dengan kata sandi acak buatan Anda (mis. 24+ karakter). Simpan (Ctrl+S).

## 2. Deploy sebagai Web App
1. Klik **Deploy → New deployment**, pilih tipe **Web app**.
2. **Execute as:** `Me` · **Who has access:** `Anyone`.
3. Klik **Deploy**, izinkan akses (Authorize), lalu salin **Web app URL**
   (berakhiran `/exec`).

## 3. Hubungkan ke Netlify
Di dashboard Netlify: **Project configuration → Environment variables**, tambahkan:

| Nama variabel | Nilai |
| --- | --- |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Web app URL dari langkah 2 |
| `GOOGLE_SHEETS_SECRET` | Nilai `SECRET` yang sama dengan di `Code.gs` |

Lalu **Deploys → Trigger deploy** agar variabel aktif.

## 4. Uji
Selesaikan kuis dengan skor ≥ 60%, isi nama dan negara, lalu klik **Buat & Unduh Sertifikat (PDF)**.
Baris baru akan muncul di tab **Sertifikat** pada spreadsheet.

> Jika Anda mengubah kode Apps Script, gunakan **Deploy → Manage deployments → Edit →
> Version: New version** agar URL tetap sama.
