import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getUserFromToken,
  listMemberships,
  SESSION_COOKIE_NAME,
  type AuthUser,
  type WorkspaceMembership,
} from '@bid-os/auth';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return getUserFromToken(token);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export interface Session {
  user: AuthUser;
  membership: WorkspaceMembership;
  workspaces: WorkspaceMembership[];
}

/** Requires an authenticated user with at least one workspace. */
export async function requireSession(): Promise<Session> {
  const user = await requireUser();
  const workspaces = await listMemberships(user.id);
  const membership = workspaces[0];
  if (!membership) redirect('/login');
  return { user, membership, workspaces };
}
