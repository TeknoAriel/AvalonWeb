import type { CatalogSyncManifest } from '@avalon/core';
import { list, put } from '@vercel/blob';

const MANIFEST_PATHNAME = 'avalon/catalog-sync-manifest.json';

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null;
}

/** Lee el manifiesto previo (id → last_update). Sin token de Blob → null. */
export async function readCatalogSyncManifestFromBlob(): Promise<CatalogSyncManifest | null> {
  const token = blobToken();
  if (!token) return null;
  try {
    const { blobs } = await list({ prefix: 'avalon/catalog-sync', limit: 20, token });
    const hit = blobs.find((b) => b.pathname === MANIFEST_PATHNAME);
    if (!hit?.url) return null;
    const res = await fetch(hit.url);
    if (!res.ok) return null;
    const data = (await res.json()) as CatalogSyncManifest;
    if (!data || typeof data.entries !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

/** Persiste el manifiesto tras un ingest exitoso. Sin token → no-op. */
export async function writeCatalogSyncManifestToBlob(manifest: CatalogSyncManifest): Promise<void> {
  const token = blobToken();
  if (!token) return;
  await put(MANIFEST_PATHNAME, JSON.stringify(manifest), {
    access: 'public',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
