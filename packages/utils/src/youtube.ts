/** Convierte URL de YouTube a embed (mejor esfuerzo). */
export function toYouTubeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname === 'youtu.be' || u.hostname.endsWith('.youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    /* ignore */
  }
  return trimmed;
}

const ID_11 = /^[a-zA-Z0-9_-]{11}$/;
const ID_LIKE = /^[a-zA-Z0-9_-]{6,32}$/;

/** Obtiene el id de video desde un id suelto o una URL watch/short/embed. */
export function extractYouTubeVideoId(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  if (ID_11.test(t)) return t;
  try {
    const u = new URL(t);
    if (u.hostname === 'youtu.be' || u.hostname.endsWith('.youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id && ID_LIKE.test(id) ? id : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v && ID_LIKE.test(v)) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed?.[1] && ID_LIKE.test(embed[1])) return embed[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Embed youtube-nocookie con recorte opcional (segundos). `rel=0` reduce videos sugeridos. */
export function buildYouTubeNoCookieEmbedUrl(
  videoId: string,
  opts?: { start?: number; end?: number },
): string {
  const q = new URLSearchParams({ rel: '0' });
  if (opts?.start != null && Number.isFinite(opts.start)) q.set('start', String(Math.max(0, Math.floor(opts.start))));
  if (opts?.end != null && Number.isFinite(opts.end)) q.set('end', String(Math.max(0, Math.floor(opts.end))));
  const qs = q.toString();
  return `https://www.youtube-nocookie.com/embed/${videoId}${qs ? `?${qs}` : ''}`;
}
