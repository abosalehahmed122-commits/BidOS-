import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@bid-os/db';

/**
 * Sessions are signed JWTs (jose/HS256) bound to a server-side `Session` row,
 * so they are stateless to read yet revocable (delete the row to kill it).
 * Framework-agnostic: cookie reading/writing lives in the web app.
 */

const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 30);
const COOKIE_NAME = 'bidos_session';

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET is missing or too short (min 16 chars)');
  }
  return new TextEncoder().encode(s);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export interface SessionMeta {
  userAgent?: string | null;
  ip?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function createSession(
  userId: string,
  meta: SessionMeta = {},
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);

  const session = await prisma.session.create({
    data: {
      userId,
      // temporary unique placeholder, replaced with sha256(token) below
      tokenHash: sha256(randomBytes(32).toString('hex')),
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    },
  });

  const token = await new SignJWT({ sid: session.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret());

  await prisma.session.update({
    where: { id: session.id },
    data: { tokenHash: sha256(token) },
  });

  return { token, expiresAt };
}

export async function getUserFromToken(token: string | undefined | null): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const sid = typeof payload.sid === 'string' ? payload.sid : undefined;
    if (!sid) return null;

    const session = await prisma.session.findUnique({
      where: { id: sid },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) return null;
    if (session.tokenHash !== sha256(token)) return null;
    if (!session.user.isActive) return null;

    return { id: session.user.id, email: session.user.email, name: session.user.name };
  } catch {
    return null;
  }
}

export async function destroySession(token: string | undefined | null): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, secret());
    const sid = typeof payload.sid === 'string' ? payload.sid : undefined;
    if (sid) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => undefined);
    }
  } catch {
    // invalid token — nothing to destroy
  }
}
