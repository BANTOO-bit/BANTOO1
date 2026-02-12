# 🚀 Panduan Setup Supabase - BANTOO Food Delivery

## Prasyarat
- Akun Supabase (gratis: [supabase.com](https://supabase.com))
- Project Supabase sudah dibuat

---

## Step 1: Buat Project (Jika Belum Ada)

1. Login ke [supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi:
   - **Name:** `bantoo-food` (atau nama lain)
   - **Database Password:** catat dan simpan!
   - **Region:** Southeast Asia (Singapore) — pilih yang paling dekat
4. Tunggu project selesai dibuat (~2 menit)

---

## Step 2: Deploy Database Schema

1. Buka **SQL Editor** di sidebar kiri Dashboard Supabase
2. Klik **"New Query"**
3. Buka file `supabase/schema.sql` dari project BANTOO
4. Copy seluruh isi file, paste ke SQL Editor
5. Klik **"Run"** (atau tekan Ctrl+Enter)
6. Pastikan output: **"Success. No rows returned"**

### Verifikasi:
Buka **Table Editor** → Pastikan tabel berikut sudah ada:

| No | Tabel | Deskripsi |
|----|-------|-----------|
| 1 | `profiles` | Data user (customer, merchant, driver, admin) |
| 2 | `merchants` | Data warung |
| 3 | `menu_items` | Menu per warung |
| 4 | `drivers` | Data driver |
| 5 | `orders` | Pesanan |
| 6 | `order_items` | Item per pesanan |
| 7 | `wallets` | Saldo user |
| 8 | `transactions` | Riwayat transaksi |
| 9 | `withdrawals` | Penarikan saldo |
| 10 | `promos` | Kode promo |

---

## Step 3: Ambil API Credentials

1. Buka **Settings** → **API** di sidebar
2. Catat dua value ini:

| Key | Lokasi | Contoh |
|-----|--------|--------|
| **Project URL** | Di bagian "Project URL" | `https://abcdefgh.supabase.co` |
| **anon public key** | Di bagian "Project API Keys" → `anon` `public` | `eyJhbGciOiJIUzI1NiIs...` |

---

## Step 4: Konfigurasi Environment Variables

1. Buka file `.env` di root folder project (`c:\BANTOO1\.env`)
2. Ganti placeholder dengan credentials dari Step 3:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...panjang-sekali...
```

3. **PENTING:** Restart dev server setelah mengubah `.env`:
```powershell
# Tekan Ctrl+C untuk stop, lalu:
npm run dev
```

---

## Step 5: Enable Realtime

Agar notifikasi order real-time berfungsi:

1. Buka **Database** → **Replication** di sidebar
2. Di bagian **"supabase_realtime"**, klik toggle untuk mengaktifkan tabel:
   - ✅ `orders` (WAJIB — untuk notifikasi pesanan baru)
   - ✅ `drivers` (untuk tracking lokasi driver)
3. Klik **"Save"**

---

## Step 6: Verifikasi Koneksi

1. Jalankan project:
```powershell
cd c:\BANTOO1
npm run dev
```

2. Buka `http://localhost:5173` di browser
3. Buka **DevTools** (F12) → tab **Console**
4. ✅ **BERHASIL** jika: Tidak ada error merah terkait Supabase
5. ❌ **GAGAL** jika: Ada error `"Supabase credentials belum dikonfigurasi"`

---

## Step 7: Buat Akun Admin

Setelah koneksi berhasil, buat akun admin pertama:

1. Buka **Authentication** → **Users** di Supabase Dashboard
2. Klik **"Add User"** → **"Create New User"**
3. Isi:
   - **Email:** `admin@bantoo.com`
   - **Password:** (buat password kuat)
4. Setelah user dibuat, buka **Table Editor** → tabel `profiles`
5. Edit row untuk admin, set `role` = `admin`

---

## Troubleshooting

### Error: "Invalid API key"
- Pastikan `VITE_SUPABASE_ANON_KEY` benar (copy ulang dari dashboard)
- Pastikan tidak ada spasi/karakter tambahan

### Error: "relation does not exist"
- Schema belum di-deploy. Ulangi Step 2.

### Data tidak muncul setelah insert
- Periksa RLS policies. Pastikan user sudah login sebelum query data.

### Realtime tidak jalan
- Pastikan Replication sudah diaktifkan untuk tabel terkait (Step 5)
- Refresh browser dan cek Console untuk error subscription
