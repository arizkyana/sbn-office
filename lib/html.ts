/**
 * Konten editor dianggap kosong bila tidak ada teks setelah tag HTML dibuang,
 * misalnya `<p></p>` yang dihasilkan editor kosong.
 */
export function isEmptyHtml(html: string) {
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;| /g, " ")
      .trim() === ""
  );
}
