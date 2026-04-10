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
