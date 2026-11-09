# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Konteks Project

`sbn-office` adalah panel admin (Office) untuk **SBN Crowdfunding Platform**. Repo ini bagian dari workspace `../../` yang **bukan monorepo** (tiap folder punya repo git sendiri):

- `../sbn-donatur`: app publik untuk donatur, mengikuti pola source code app ini.
- `../sbn-supabase`: migration, storage bucket, dan generate types Supabase. Skema database diubah di sana, bukan di sini.
- `../../planning/init.md`: spesifikasi utama (routes, data model, RLS, design pattern). `../../planning/001-fondasi.md`: backlog fondasi (task `FND001`–`FND017`). `../../planning/002-campaign.md`: backlog campaign (task `CMP001`–`CMP012`). Baca dokumen ini sebelum mengerjakan fitur.

Fondasi sudah selesai: Supabase client, `proxy.ts`, login admin, proteksi halaman, dan sidebar. Modul campaign (`/campaigns`, `/campaigns/new`, `/campaigns/[uuid]`) ada di `containers/campaigns/`. Halaman modul lain (transaksi, donatur, blog, pengaturan) belum ada; menunya sudah tersedia di sidebar (`components/layout/navigation.ts`).

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
- Komponen shadcn memakai style `base-nova`, yang dibangun di atas `@base-ui/react` (bukan Radix). Komposisi elemen memakai prop `render` (contoh: `<SidebarMenuButton render={<Link href="/" />}>`), bukan `asChild`. `cn` berasal dari package npm `cn` (pengganti clsx + tailwind-merge). Komponen `components/ui/*` mengimpornya langsung dari `"cn"`, sedangkan `lib/utils.ts` hanya me-re-export-nya.
- Dengan `cacheComponents`, kode yang tidak deterministik saat prerender (`Math.random()`, `Date.now()`) membuat build gagal. Contohnya `SidebarMenuSkeleton` bawaan shadcn, jadi fallback memakai `Skeleton`. `usePathname()` di luar `<Suspense>` juga akan menunda render begitu ada route dengan param dinamis (seperti `/campaigns/[uuid]`). Karena itu `AppSidebar` dibungkus `<Suspense>` di `app/(dashboard)/layout.tsx`.

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
- Helper bersama di `lib/`: `slug.ts` (`slugify()`), `html.ts` (`isEmptyHtml()`), `sanitize.ts` (`sanitizeRichText()`, server-only, allowlist sama dengan output editor), `date.ts` (konversi tanggal Asia/Jakarta untuk `<input type="date">` dan `timestamptz`), `campaign.ts` (label/opsi status, `getProgressPercent()`).
- `components/editor/RichTextEditor.tsx`: editor Tiptap (HTML) yang dipakai bersama campaign, blog, dan pengaturan lewat `Controller` react-hook-form. `hooks/use-debounced-value.ts` untuk pencarian di halaman daftar.
- Fungsi baca data di server (Server Component) ditaruh di `containers/<modul>/<halaman>/queries.ts` dan dibungkus `React.cache()`, contoh `getCampaignByUuid()`.

`containers/auth/login/` adalah contoh lengkap pola ini (schema, action, hook, form). `containers/campaigns/form/` (form tambah/ubah + upload file) dan `containers/campaigns/list/` (daftar dengan pagination, pencarian, dan filter) adalah contoh untuk modul CRUD. Ikuti pola tersebut saat membuat modul baru.

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
- Dashboard memakai `@tanstack/charts`. Export Excel transaksi dijalankan di server dan mengikuti filter yang sedang aktif.

### Keamanan

- RLS aktif di semua tabel. Pengecekan admin dilakukan oleh `is_admin()` di database (membaca `profiles.role`) dan oleh `requireAdmin()` di aplikasi.
- Proteksi di layout **tidak** melindungi Server Action, jadi setiap Server Action / Route Handler di office harus memanggil `requireAdmin()`.
- `lib/auth.ts` dan `lib/supabase/admin.ts` diawali `import "server-only";`. Pakai `admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`) hanya untuk kebutuhan yang memang memerlukannya: insert/update `transactions` dan Midtrans, ban user, serta export.
- Menonaktifkan donatur dilakukan dengan dua langkah: set `profiles.is_active = false` lalu ban user lewat Supabase Auth Admin API.

### Konvensi lain

- Teks UI ditulis dalam Bahasa Indonesia.
- Nominal rupiah ditampilkan lewat `formatRupiah()` di `lib/utils.ts` (`Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`).
- Nama kolom foreign key memakai format `<tabel>_id` (contoh: `campaigns_id`, `users_id`).
- Env ada di `.env.local` (di-gitignore). Variabel tanpa prefix `NEXT_PUBLIC_` (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `RESEND_API_KEY`) hanya boleh dipakai di server. `MIDTRANS_IS_PRODUCTION=false` sampai go-live.
