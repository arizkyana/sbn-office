import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Dengan `cacheComponents`, Next.js menyembunyikan halaman yang ditinggalkan
 * (React `<Activity>`) alih-alih melepasnya, sehingga isi form masih ada saat
 * halaman dibuka lagi. Panggil `schedule(reset)` setelah Simpan berhasil atau
 * saat Batal: `reset` dijalankan ketika halaman disembunyikan, jadi form tidak
 * terlihat kosong sebelum pindah halaman. Draf yang ditinggal tanpa Simpan/Batal
 * tetap tersimpan.
 *
 * Rujukan: node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md
 */
export function useResetOnHide() {
  const pendingReset = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const pending = pendingReset;
    // Cleanup berjalan saat Activity menyembunyikan halaman (dan saat unmount).
    return () => {
      pending.current?.();
      pending.current = null;
    };
  }, []);

  const schedule = useCallback((reset: () => void) => {
    pendingReset.current = reset;
  }, []);

  const cancel = useCallback(() => {
    pendingReset.current = null;
  }, []);

  return { schedule, cancel };
}
