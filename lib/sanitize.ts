import "server-only";

import sanitizeHtml from "sanitize-html";

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
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, richTextOptions);
}
