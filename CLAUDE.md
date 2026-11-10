# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Konteks Project

`sbn-office` adalah panel admin (Office) untuk **SBN Crowdfunding Platform**. Repo ini bagian dari workspace `../../` yang **bukan monorepo** (tiap folder punya repo git sendiri):

- `../sbn-donatur`: app publik untuk donatur, mengikuti pola source code app ini.
- `../sbn-supabase`: migration, storage bucket, dan generate types Supabase. Skema database diubah di sana, bukan di sini.
- `../../planning/init.md`: spesifikasi utama (routes, data model, RLS, design pattern). `../../planning/001-fondasi.md`: backlog fondasi (task `FND001`–`FND017`). `../../planning/002-campaign.md`: backlog campaign (task `CMP001`–`CMP012`). `../../planning/005-akun-donatur.md`: backlog akun donatur (task office `AKN009`–`AKN011`). `../../planning/006-blog.md`: backlog blog (task office `BLG001`–`BLG005`). `../../planning/007-pengaturan.md`: backlog pengaturan (task office `SET001`–`SET002`). Baca dokumen ini sebelum mengerjakan fitur.

Fondasi sudah selesai: Supabase client, `proxy.ts`, login admin, proteksi halaman, dan sidebar. Modul yang sudah ada:

- campaign (`/campaigns`, `/campaigns/new`, `/campaigns/[uuid]`) di `containers/campaigns/`;
- transaksi (`/transactions`, `/transactions/[uuid]`, `/transactions/export`) di `containers/transactions/`;
- dashboard (`/`) di `containers/dashboard/`;
- donatur (`/donors`, `/donors/[id]`) di `containers/donors/`;
- blog (`/blog/posts`, `/blog/posts/new`, `/blog/posts/[uuid]`, `/blog/categories`) di `containers/blog/`;
- pengaturan (`/settings`) di `containers/settings/`.

Semua menu sidebar (`components/layout/navigation.ts`) sudah punya halaman.

Route Office: `/auth/login`, `/` (dashboard), `/campaigns`, `/transactions`, `/donors`, `/blog/posts`, `/blog/categories`, `/settings`. Semua halaman admin dibuat di route group `app/(dashboard)/`, supaya ikut layout sidebar dan `AdminGate`.

## Perintah

```bash
npm run dev            # dev server (Turbopack) di http://localhost:3000
npm run build          # production build
npm run lint           # ESLint (flat config) untuk seluruh project
npx eslint <path>      # lint satu file
npx tsc --noEmit       # type check
npx shadcn add <nama>  # tambah komponen UI ke components/ui/
```

Belum ada test runner. Setelah memindah atau menghapus route, `npx tsc --noEmit` bisa error karena `.next/types/validator.ts` masih menyimpan route lama; jalankan `npm run build` untuk menulis ulangnya.

`lib/supabase/database.types.ts` di-generate dari `../sbn-supabase` dengan `npm run db:types`. Jangan diedit manual.

## Next.js 16: Hal yang Berbeda

- `next.config.ts` mengaktifkan `cacheComponents: true` dan `partialPrefetching`. Komponen yang membaca cookies/session **wajib** dibungkus `<Suspense>`, dan session tidak boleh di-`await` di top-level layout. Rujukan: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- `middleware.ts` sudah diganti `proxy.ts`. Rujukan: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. Refresh session Supabase dijalankan di sini.
- `LayoutProps<"/">` / `PageProps` adalah tipe global hasil typegen Next, jadi tidak perlu di-import.
- Tailwind v4 dimuat lewat loader `@tailwindcss/turbopack` di `next.config.ts`. Tidak ada `tailwind.config` maupun PostCSS config; token tema ada di `app/globals.css`.
- Tampilan mengikuti panduan gaya bersama dengan sbn-donatur (`../../planning/009-tampilan-office.md`, acuan nilai di `sbn-donatur/app/globals.css`):
  - token `:root` (latar ber-tint `--background`, `--card` putih, `--primary-strong` untuk gradien, `--brand-gold`/`--brand-gold-strong`, `--muted-foreground` kontras ≥ 4,5:1), `--shadow-card`, `--radius: 0.75rem`, dan font Plus Jakarta Sans (+ Geist Mono) **sama persis** dengan donatur. Bila salah satu diubah, ubah juga di app lain;
  - yang khusus office: token `--sidebar-*` (sidebar putih, garis ber-tint) dan ukuran kontrol desktop (Button/Input/Select `h-10 text-sm`);
  - tanpa mode gelap: `.dark` tidak dipakai dan `Toaster` dipaksa `theme="light"`.
- Komponen shadcn memakai style `base-nova`, yang dibangun di atas `@base-ui/react` (bukan Radix). Komposisi elemen memakai prop `render` (contoh: `<SidebarMenuButton render={<Link href="/" />}>`), bukan `asChild`. `cn` berasal dari package npm `cn` (pengganti clsx + tailwind-merge). Komponen `components/ui/*` mengimpornya langsung dari `"cn"`, sedangkan `lib/utils.ts` hanya me-re-export-nya.
- Dengan `cacheComponents`, kode yang tidak deterministik saat prerender (`Math.random()`, `Date.now()`) membuat build gagal. Contohnya `SidebarMenuSkeleton` bawaan shadcn, jadi fallback memakai `Skeleton`. `usePathname()` di luar `<Suspense>` juga akan menunda render begitu ada route dengan param dinamis (seperti `/campaigns/[uuid]`). Karena itu `AppSidebar` dibungkus `<Suspense>` di `app/(dashboard)/layout.tsx`.
- `loading.tsx` di `app/(dashboard)/` akan membungkus semua halaman di route group itu, bukan hanya dashboard. Karena itu `app/(dashboard)/page.tsx` memakai `<Suspense fallback={<DashboardSkeleton />}>`.
- Dengan `cacheComponents`, halaman yang ditinggalkan disembunyikan dengan React `<Activity>` (maksimal 3 route), bukan dilepas, sehingga isi form tetap ada saat halaman dibuka lagi. Form dengan Simpan/Batal memakai `useResetOnHide()` (`hooks/use-reset-on-hide.ts`): panggil `schedule(reset)` setelah Simpan berhasil dan saat Batal (juga sebelum login), dan form di-reset ketika halaman disembunyikan. Draf yang ditinggal tanpa Simpan/Batal tetap tersimpan. Isi dialog sudah ter-reset sendiri karena dilepas saat ditutup. Rujukan: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.

## Arsitektur

### Struktur folder

- `app/` hanya untuk routing (`page.tsx`, `layout.tsx`, `route.ts`) dan tidak berisi logika. `page.tsx` cukup me-render container.
- `containers/<modul>/<halaman>/` berisi:
  - `<Nama>.tsx`: komponen utama halaman (named export), di-re-export lewat `index.ts`.
  - `<Nama>.types.ts`: schema zod beserta type hasil `z.infer`.
  - `actions.ts`: Server Action (`"use server"`).
  - `components/`: komponen khusus halaman tersebut.
  - `hooks/use<Nama>.ts`: logika client (react-hook-form, pemanggilan action, query).
- `components/layout/`: kerangka halaman admin. Isinya `AdminGate` (memanggil `requireAdmin()`), `AppSidebar` dan `navigation.ts` (daftar menu dan `isActivePath()`), `NavUser` (nama/email admin dan tombol Keluar), serta `actions.ts` (`logout()`).
- `lib/supabase/`:
  - `client.ts` (browser);
  - `server.ts` (session user, RLS berlaku);
  - `admin.ts` (service role);
  - `proxy.ts` (`updateSession()` untuk `proxy.ts` di root);
  - `database.types.ts` (hasil generate).
- `lib/auth.ts`:
  - `getCurrentUser()`, dibungkus `React.cache()` sehingga cukup satu query per request walau dipanggil gate, sidebar, dan halaman;
  - `isActiveAdmin()`;
  - `requireAdmin()` (mengembalikan admin yang login, termasuk `id` untuk kolom `users_id`).
- Helper bersama di `lib/`:
  - `slug.ts` (`slugify()`, `SLUG_PATTERN` untuk slug campaign/post dan alias kategori), `html.ts` (`isEmptyHtml()`), `sanitize.ts` (`sanitizeRichText()`, server-only, allowlist sama dengan output editor);
  - `utils.ts` (`formatRupiah()`); `search.ts` (`escapeLike()` dan `buildIlikeOrFilter()` untuk pencarian `ilike`/`.or()` di daftar campaign, transaksi, dan donatur);
  - `date.ts` (zona Asia/Jakarta: nilai `<input type="date">`, awal/akhir hari untuk filter, `formatDate()`, `formatDateTime()`, dan `toJakartaDateTime()` untuk sel tanggal Excel);
  - `campaign.ts` (label/opsi status, `getProgressPercent()`); `post.ts` (label/opsi tipe dan status post, `getPostImage()`: cover atau thumbnail YouTube);
  - `cover.ts`: batas file asli 10 MB (`getCoverSourceError()`, sebelum crop) dan batas file yang diunggah 2 MB sesuai bucket (`getCoverFileError()`, dipakai client dan server), serta rasio dan format hasil crop (JPEG 16:9, lebar maksimal 1600 px); `image-processing.ts` (khusus browser, lewat canvas: `cropImage()` untuk cover 16:9 dan `resizeImage()` untuk gambar konten, keduanya JPEG lebar maksimal 1600 px); `storage.ts` (server-only, `uploadImage(bucket, file)` untuk `campaign-covers`, `post-covers`, dan `content-images`; pemanggilnya wajib `requireAdmin()` lebih dulu);
  - `youtube.ts` (`getYouTubeId()`, `getYouTubeEmbedUrl()`, `getYouTubeThumbnail()`). Isinya sama persis dengan `sbn-donatur/lib/youtube.ts`; bila diubah, salin ke app lain;
  - `transaction.ts` (label, opsi, dan varian badge status pembayaran), `payment-method.ts` (`getPaymentMethodLabel()`);
  - `whatsapp.ts` (`normalizeWhatsappNumber()`: `08…`/`+62…`/`62…` → `62…` tanpa `+`, format `wa.me`); `donatur.ts` (`getDonaturUrl(path)` dari `NEXT_PUBLIC_DONATUR_URL`, `null` bila env kosong);
  - `midtrans.ts` (server-only): `getTransactionStatus()`, `mapPaymentStatus()`, `getPaidAt()`. Salinan sebagian `sbn-donatur/lib/midtrans.ts`; bila logika status berubah, ubah keduanya.
- Komponen yang dipakai lebih dari satu container (named export): badge status di `components/campaigns/`, `components/transactions/`, dan `components/donors/`; `components/transactions/TransactionTable.tsx` (daftar transaksi dan riwayat donasi di detail donatur, prop `showDonor`); `components/detail/DetailList.tsx` (daftar label–nilai di halaman detail); `components/upload/CoverUpload.tsx` (upload cover lewat prop `upload`, yaitu Server Action seperti `uploadCover` atau `uploadPostCover`; form menerima URL lewat `onChange` dan status upload lewat `onUploadingChange`). File yang dipilih dibuka dulu di `CoverCropDialog` (`react-easy-crop`: geser, zoom slider/scroll/cubit, rasio terkunci 16:9), lalu hasil crop yang sudah dikompres diunggah. `components/ui/slider.tsx` merender dua thumb bila `value` berupa angka, jadi kirim array (`value={[zoom]}`).
- `components/editor/RichTextEditor.tsx`: editor Tiptap (HTML) yang dipakai bersama campaign, blog, dan pengaturan lewat `Controller` react-hook-form.
  - Gambar di dalam konten aktif bila prop `imageUpload` diisi (semua form memakai `uploadEditorImage` dari `components/editor/actions.ts`, bucket `content-images`). Tombol "Gambar", paste, dan drag-drop memanggil `handleImageUpload()` di `components/editor/image-upload.ts` (padanan `handlers.image` Quill): validasi 10 MB, perkecil di browser, upload, lalu sisipkan di posisi kursor/drop.
  - Tabel (`@tiptap/extension-table`, `TableKit` tanpa resize kolom): tombol "Tabel" menyisipkan tabel 3×3 dengan baris judul; saat kursor di dalam tabel, `TableToolbar` menampilkan aksi tambah/hapus baris dan kolom, baris judul, dan hapus tabel. Sanitizer menyimpan `table`/`thead`/`tbody`/`tr`/`th`/`td` dengan `colspan`/`rowspan` saja (tanpa `style`), jadi lebar kolom selalu otomatis.
  - `sanitizeRichText()` hanya menyimpan `<img>` dari bucket `content-images` project ini (`isContentImageUrl()` di `lib/content-image.ts`); gambar dari situs lain dan `data:` dibuang. Saat HTML ditempel, gambar asing juga dibuang di editor (`removeForeignImages()`). `isEmptyHtml()` menganggap konten berisi gambar tidak kosong. `hooks/use-debounced-value.ts` untuk pencarian di halaman daftar.
- Fungsi baca data di server (Server Component) ditaruh di `containers/<modul>/<halaman>/queries.ts` dan dibungkus `React.cache()`, contoh `getCampaignByUuid()`.

`containers/auth/login/` adalah contoh lengkap pola ini (schema, action, hook, form). `containers/campaigns/form/` (form tambah/ubah + upload file) dan `containers/campaigns/list/` (daftar dengan pagination, pencarian, dan filter) adalah contoh untuk modul CRUD. Ikuti pola tersebut saat membuat modul baru.

`containers/transactions/` menambah dua pola:

- `list/filters.ts` (tanpa `server-only`): `applyTransactionFilters()` dipakai daftar di client dan export di server, agar hasilnya selalu sama.
- Route Handler: `app/(dashboard)/transactions/export/route.ts` hanya memanggil `exportTransactions()` di `containers/transactions/export/`, yang memanggil `requireAdmin()` sendiri.

`containers/donors/` (backlog 005):

- Daftar membaca `profiles` ber-role `DONATUR`, termasuk `profiles.email` yang disinkronkan trigger dari `auth.users` (AKN001), karena `auth.users` tidak bisa dibaca lewat API. Akun ADMIN tidak tampil dan tidak bisa diubah dari halaman ini.
- Route detail memakai `profiles.id` (uuid `users_id`), sama dengan link "Lihat akun donatur" di detail transaksi. Riwayat donasi memakai query key yang diawali `"transactions"` agar ikut diperbarui saat transaksi dicek ulang.
- `setDonorActive()` mengubah dua hal lewat admin client: ban di Supabase Auth (`ban_duration` `876000h`/`none`, agar login ditolak dan session tidak bisa diperpanjang) dan `profiles.is_active` (dibaca sbn-donatur untuk login, `requireDonatur()`, dan prefill donasi). Bila update profil gagal, ban dikembalikan.

`containers/blog/` (backlog 006):

- Kategori dikelola lewat dialog (`components/ui/dialog.tsx`) di satu halaman tanpa pagination. Hapus ditolak bila kategori masih dipakai post (`23503`, FK `on delete restrict`). Opsi kategori untuk form dan filter post ada di `categories/hooks/useCategoryOptions.ts` (key `["categories", "options"]`).
- Form post dipakai halaman tambah dan ubah. `video_url` wajib dan harus dikenali `getYouTubeId()` untuk VIDEO, juga saat DRAFT (constraint database), dan disimpan `null` untuk ARTICLE. `published_at` diisi `savePost()` hanya saat pertama kali PUBLISH, lalu tidak berubah lagi.
- `categories_id` di form berupa string (value Select) dan diubah ke angka di action.

`containers/settings/` (backlog 007):

- Tabel `settings` berisi tiga baris per `key` (`whatsapp_number`, `terms_and_conditions`, `company_profile`) yang dibaca publik oleh sbn-donatur. Tiga Server Action terpisah (satu per kartu) menyimpan lewat `upsert` per `key` dengan server client (RLS admin).
- Nomor WhatsApp disimpan sudah dinormalisasi (`62…`), dan HTML disanitasi `sanitizeRichText()`. Action mengembalikan nilai yang tersimpan, lalu form di-`reset()` ke nilai itu.
- Schema dan action tidak bisa dikirim dari Server Component sebagai props, jadi `ContentForm` memilihnya sendiri lewat prop `kind` (`terms`/`profile`).

### Alur auth

1. `proxy.ts` me-refresh session (`getClaims()`). Tanpa session dan path bukan `/auth/*`, request diarahkan ke `/auth/login`. Proxy tidak mengecek role.
2. `app/(dashboard)/layout.tsx` merender shell sidebar (bagian statis) dan membungkus halaman dengan `<Suspense><AdminGate>`.
3. Di halaman login, `RedirectIfAdmin` mengarahkan admin yang sudah login ke `/`. Pengecekan ini sengaja tidak ditaruh di proxy: admin nonaktif yang masih punya session akan terjebak redirect bolak-balik.

### Mutasi data: Server Action + Zod

Semua perubahan data (termasuk login/logout) dilakukan lewat Server Action. Komponen client tidak menulis ke Supabase secara langsung.

1. Schema zod ditulis sekali di `<Nama>.types.ts`, lalu dipakai oleh `zodResolver` di client dan `schema.safeParse()` di server. Schema tidak boleh ditaruh di `actions.ts`, karena file `"use server"` hanya boleh mengekspor async function. Pesan validasi ditulis dalam Bahasa Indonesia.
2. Urutan langkah di dalam Server Action:
   1. `await requireAdmin()` di baris pertama. Pengecualiannya hanya `login()` (belum ada session) dan `logout()` (user nonaktif pun harus bisa keluar).
   2. `safeParse`; bila gagal, return `z.flattenError(result.error).fieldErrors`.
   3. Akses Supabase lewat `lib/supabase/server.ts`.
   4. `revalidatePath()` / `redirect()` bila perlu.
   5. Return `ActionResult`.
3. Hook memanggil action dari `handleSubmit`:
   - Status loading memakai `formState.isSubmitting`.
   - `fieldErrors` dipasang ke field lewat `setError`, sedangkan `message` dipasang ke `setError("root", ...)` dan ditampilkan di atas form.
   - Bila action melakukan `redirect()`, hasil `await action()` di client tidak bisa diandalkan. Karena itu cek dengan `if (!result || result.success) return;`.
   - `redirect()` di dalam action harus berada di luar `try/catch`.
   - Setelah action berhasil, panggil `queryClient.invalidateQueries({ queryKey: ["<modul>"] })`.

```ts
// lib/types.ts
export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };
```

### Membaca data

- Daftar dengan pagination/filter/pencarian memakai Tanstack Query (`useQuery` + `placeholderData: keepPreviousData`) dengan `lib/supabase/client.ts` (dilindungi RLS), `.range()`, dan `{ count: "exact" }`. Format query key: `["<modul>", { ...params }]`, contoh `["transactions", { page, status, campaignsId }]`.
- Data yang membutuhkan secret (service role, Midtrans) dibaca lewat Server Component atau Route Handler, tidak pernah dari client.
- Admin membaca `transactions` dengan server/browser client biasa, karena RLS (`is_admin()`) sudah mengizinkan admin membaca semua baris.
- Dashboard memakai `@tanstack/charts` (komponen client yang menerima data dari server) dan view `dashboard_summary` (`security_invoker`).
- Export Excel transaksi (`exceljs`) dijalankan di server dan mengikuti filter yang sedang aktif. PostgREST membatasi satu respons 1.000 baris, jadi data diambil per 1.000 baris dengan `.range()`.

### Keamanan

- RLS aktif di semua tabel. Pengecekan admin dilakukan oleh `is_admin()` di database (membaca `profiles.role`) dan oleh `requireAdmin()` di aplikasi.
- Proteksi di layout **tidak** melindungi Server Action, jadi setiap Server Action / Route Handler di office harus memanggil `requireAdmin()`.
- `lib/auth.ts` dan `lib/supabase/admin.ts` diawali `import "server-only";`. Pakai `admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`) hanya untuk kebutuhan yang memang memerlukannya: update `transactions` (cek ulang status ke Midtrans) dan ban user. Export membaca dengan server client.
- Menonaktifkan donatur dilakukan dengan dua langkah: set `profiles.is_active = false` lalu ban user lewat Supabase Auth Admin API.

### Konvensi lain

- Teks UI ditulis dalam Bahasa Indonesia.
- Nominal rupiah ditampilkan lewat `formatRupiah()` di `lib/utils.ts` (`Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`).
- Nama kolom foreign key memakai format `<tabel>_id` (contoh: `campaigns_id`, `users_id`).
- Env ada di `.env.local` (di-gitignore). Variabel tanpa prefix `NEXT_PUBLIC_` (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `RESEND_API_KEY`) hanya boleh dipakai di server. `MIDTRANS_IS_PRODUCTION=false` sampai go-live. `NEXT_PUBLIC_DONATUR_URL` (lokal `http://localhost:3002`) dipakai link "Lihat di website" di halaman pengaturan; nilainya ditanam saat build/dev server dijalankan, jadi restart dev server setelah mengubahnya.
