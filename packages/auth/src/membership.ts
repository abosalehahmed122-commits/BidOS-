import { prisma } from '@bid-os/db';
import type { Role } from '@bid-os/core';

export interface WorkspaceMembership {
  workspaceId: string;
  workspaceName: string;
  slug: string;
  role: Role;
}

export async function listMemberships(userId: string): Promise<WorkspaceMembership[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  return memberships.map((m) => ({
    workspaceId: m.workspaceId,
    workspaceName: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role as Role,
  }));
}

export async function getMembership(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceMembership | null> {
  const m = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { workspace: true },
  });
  if (!m) return null;
  return {
    workspaceId: m.workspaceId,
    workspaceName: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role as Role,
  };
}
