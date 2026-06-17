import { forWorkspace } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { getStorage } from '@/lib/storage';

/**
 * Authorized download for PRIVATE files. Tenant isolation is enforced by
 * forWorkspace (the file is only found if it belongs to the caller's workspace).
 * S3/R2 → 302 redirect to a short-lived presigned URL; disk → stream bytes.
 */
export async function GET(req: Request) {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);

  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');
  if (!id || (type !== 'company' && type !== 'tender')) {
    return new Response('طلب غير صالح', { status: 400 });
  }

  let key: string | null = null;
  let name = 'file';
  let mime = 'application/octet-stream';

  if (type === 'company') {
    const doc = await db.companyDocument.findFirst({ where: { id } });
    if (doc) ({ storageKey: key, fileName: name, mimeType: mime } = doc);
  } else {
    const doc = await db.tenderDocument.findFirst({ where: { id } });
    if (doc) ({ storageKey: key, fileName: name, mimeType: mime } = doc);
  }
  if (!key) return new Response('غير موجود', { status: 404 });

  const storage = getStorage();
  const signed = await storage.presignGet(key, { downloadName: name });
  if (signed) return Response.redirect(signed, 302);

  // Disk fallback (local dev): stream the bytes through the app.
  const bytes = await storage.read(key);
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
    },
  });
}
