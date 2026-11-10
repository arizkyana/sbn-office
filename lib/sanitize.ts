import "server-only";

import sanitizeHtml from "sanitize-html";
import { isContentImageUrl } from "@/lib/content-image";

// Hanya tag yang bisa dihasilkan RichTextEditor. Konten ini ditampilkan sebagai
// HTML di halaman publik, jadi wajib dibersihkan di server sebelum disimpan.
const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "strong",
    "em",
    "s",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "br",
    "hr",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "loading"],
    // Penggabungan sel; style lebar kolom dari editor tidak disimpan.
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  // Gambar hanya dari bucket content-images project ini (diunggah lewat editor).
  // Gambar dari situs lain (hotlink, tracking pixel) dan data: base64 dibuang.
  exclusiveFilter: (frame) =>
    frame.tag === "img" && !isContentImageUrl(frame.attribs.src),
};

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, richTextOptions);
}
