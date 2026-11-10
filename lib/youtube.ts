// Dipakai sbn-office dan sbn-donatur. Bila diubah, salin apa adanya ke app lain.

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

/**
 * ID video dari URL YouTube: `youtube.com/watch?v=ID`, `youtu.be/ID`,
 * `youtube.com/shorts/ID`, dan `youtube.com/embed/ID` (termasuk
 * `m.youtube.com`). `null` bila bukan URL video YouTube.
 */
export function getYouTubeId(url: string) {
  const trimmed = url.trim();
  let parsed: URL;
  try {
    // URL yang ditempel tanpa skema (contoh "youtu.be/ID") tetap dikenali.
    parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    return null;
  }

  const [, first, second] = parsed.pathname.split("/");
  let id: string | null | undefined;
  if (parsed.hostname === "youtu.be") {
    id = first;
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    if (first === "watch") id = parsed.searchParams.get("v");
    else if (first === "shorts" || first === "embed") id = second;
  }

  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

/** URL embed tanpa cookie pelacak sebelum video diputar. */
export function getYouTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** Thumbnail 480×360 yang selalu tersedia untuk setiap video. */
export function getYouTubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
