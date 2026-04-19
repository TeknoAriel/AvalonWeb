/**
 * Serializa el query string del listado para llevar contexto a la ficha (`returnTo`).
 * Base64url evita problemas con `&` en query strings largos.
 */
export function encodeListingReturnTo(queryString: string): string {
  const q = queryString.trim();
  if (!q) return '';
  return Buffer.from(q, 'utf8').toString('base64url');
}

export function decodeListingReturnTo(encoded: string | undefined | null): string | null {
  if (encoded == null) return null;
  const s = String(encoded).trim();
  if (!s) return null;
  try {
    return Buffer.from(s, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}
