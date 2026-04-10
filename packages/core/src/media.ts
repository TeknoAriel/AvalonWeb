import type { PropertyMedia, RawProperty } from '@avalon/types';

export function extractMedia(raw: RawProperty): PropertyMedia {
  const images = (raw.images ?? []).map((img, i) => ({
    url: img.url,
    alt: img.title?.trim() || `${raw.title} — foto ${i + 1}`,
  }));

  return {
    images,
    youtubeUrl: raw.link_youtube?.trim() || null,
    tour360Html: raw.link_360_iframe?.trim() || null,
  };
}
