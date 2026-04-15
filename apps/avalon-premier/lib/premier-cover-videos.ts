import { extractYouTubeVideoId } from '@avalon/utils';

export type PremierCoverVideoSpec = {
  videoId: string;
  start?: number;
  end?: number;
};

function parseStartEndFromUrl(u: URL): { start?: number; end?: number } {
  const endRaw = u.searchParams.get('end');
  const end = endRaw != null ? parseInt(endRaw, 10) : NaN;
  let start: number | undefined;
  const startRaw = u.searchParams.get('start');
  if (startRaw != null) {
    const s = parseInt(startRaw, 10);
    if (Number.isFinite(s)) start = s;
  }
  if (start == null) {
    const t = u.searchParams.get('t');
    if (t != null) {
      const m = /^(\d+)/.exec(t);
      if (m) {
        const s = parseInt(m[1], 10);
        if (Number.isFinite(s)) start = s;
      }
    }
  }
  return {
    start,
    end: Number.isFinite(end) ? end : undefined,
  };
}

function parseOne(segment: string): PremierCoverVideoSpec | null {
  if (!segment) return null;

  const at = segment.lastIndexOf('@');
  if (at > 0) {
    const left = segment.slice(0, at).trim();
    const right = segment.slice(at + 1).trim();
    const range = /^(\d+)-(\d+)$/.exec(right);
    if (range) {
      const videoId = extractYouTubeVideoId(left);
      if (!videoId) return null;
      return {
        videoId,
        start: parseInt(range[1], 10),
        end: parseInt(range[2], 10),
      };
    }
  }

  if (segment.includes('youtube.') || segment.includes('youtu.be')) {
    try {
      const u = new URL(segment);
      const videoId = extractYouTubeVideoId(segment);
      if (!videoId) return null;
      const { start, end } = parseStartEndFromUrl(u);
      return { videoId, start, end };
    } catch {
      return null;
    }
  }

  const videoId = extractYouTubeVideoId(segment);
  return videoId ? { videoId } : null;
}

/** Lista desde `NEXT_PUBLIC_PREMIER_COVER_VIDEOS` (coma). Ver `.env.example`. */
export function parsePremierCoverVideos(raw: string | undefined): PremierCoverVideoSpec[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => parseOne(s.trim()))
    .filter((x): x is PremierCoverVideoSpec => x != null && Boolean(x.videoId))
    .slice(0, 3);
}
