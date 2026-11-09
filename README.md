# SBN Office

Panel admin SBN Crowdfunding Platform untuk mengelola campaign, transaksi donasi, donatur, blog, dan pengaturan. Dibangun dengan Next.js 16, Supabase (Database, Auth, Storage), Tailwind, dan shadcn.

Repository terkait:

- [`sbn-supabase`](https://github.com/arizkyana/sbn-supabase): migration database, storage, generate types, dan cara membuat akun admin.
- [`sbn-donatur`](https://github.com/arizkyana/sbn-donatur): aplikasi publik untuk donatur.

## Prasyarat

- Node.js ≥ 20.9 dan npm
- Akses ke Supabase project SBN (URL, publishable key, dan service role key)
- Akun admin (lihat README `sbn-supabase`, bagian "Membuat akun admin")

## Menjalankan di lokal

```bash
npm install
# buat .env.local dan isi variabel di bawah
npm run dev
```

Buka http://localhost:3000. Tanpa session, semua halaman diarahkan ke `/auth/login`. Hanya user dengan role `ADMIN` dan `is_active = true` yang bisa masuk.

Perintah lain:

```bash
npm run build      # production build
npm run start      # menjalankan hasil build
npm run lint       # ESLint
npx tsc --noEmit   # type check
```

## Environment variables

Ditulis di `.env.local` (tidak di-commit). Rujukan lengkap ada di tabel Environment variables pada `planning/init.md`.

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya di server. Untuk transaksi, ban user, dan export |
| `MIDTRANS_SERVER_KEY` | Hanya di server. Untuk cek ulang status transaksi |
| `MIDTRANS_IS_PRODUCTION` | `false` sampai go-live |

## Database types

`lib/supabase/database.types.ts` di-generate dari skema Supabase. Setiap ada migration baru, jalankan dari repository `sbn-supabase`:

```bash
npm run db:types
```

Lalu commit file types yang berubah di repository ini.

## Deploy ke VPS

Mengikuti FND016 di `planning/001-fondasi.md`:

1. Siapkan VPS dengan Node.js ≥ 20.9, Nginx, certbot, dan PM2.
2. Clone repository, lalu buat `.env.local` di server. Environment variables tidak disimpan di repository.
3. Build dan jalankan dengan port khusus untuk aplikasi ini:

   ```bash
   npm ci
   npm run build
   pm2 start npm --name sbn-office -- start -- -p <port>
   ```

4. Atur Nginx sebagai reverse proxy ke `<port>` untuk domain office (production: `office.sobatbaik.org`), lalu pasang SSL dengan certbot.
5. Di Supabase Dashboard → Authentication → URL Configuration, tambahkan URL aplikasi ke Redirect URLs.
