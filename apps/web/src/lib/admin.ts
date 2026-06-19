import { redirect } from 'next/navigation';
import { prisma } from '@bid-os/db';
import { requireSession } from './session';

/** Promote by email without a DB edit — handy for the first operator. */
export function isSuperAdminEmail(email: string): boolean {
  const list = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function isSuperAdmin(): Promise<boolean> {
  const { user } = await requireSession();
  if (isSuperAdminEmail(user.email)) return true;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isSuperAdmin: true },
  });
  return !!dbUser?.isSuperAdmin;
}

/** Gate for the platform admin area. Redirects non-operators to the app. */
export async function requireSuperAdmin() {
  const session = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });
  if (!dbUser?.isSuperAdmin && !isSuperAdminEmail(session.user.email)) {
    redirect('/dashboard');
  }
  return session;
}
