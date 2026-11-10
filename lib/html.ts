/**
 * Konten editor dianggap kosong bila tidak ada teks setelah tag HTML dibuang,
 * misalnya `<p></p>` yang dihasilkan editor kosong. Konten yang hanya berisi
 * gambar tidak kosong.
 */
export function isEmptyHtml(html: string) {
  if (/<img\s/i.test(html)) return false;
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;| /g, " ")
      .trim() === ""
  );
}
