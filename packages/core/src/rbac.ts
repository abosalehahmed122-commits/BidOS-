import type { Role } from './constants';

/**
 * RBAC — enforced on the SERVER, never trusted from the client.
 * Roles are ranked; each permission has a minimum required role.
 */
const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
  OWNER: 3,
};

export const PERMISSIONS = [
  'tender:view',
  'tender:create',
  'tender:update',
  'tender:delete',
  'tender:analyze',
  'decision:create',
  'proposal:view',
  'proposal:create',
  'proposal:update',
  'proposal:delete',
  'companyDoc:view',
  'companyDoc:manage',
  'task:view',
  'task:manage',
  'comment:create',
  'member:view',
  'member:invite',
  'member:remove',
  'member:role',
  'billing:view',
  'billing:manage',
  'workspace:update',
  'workspace:delete',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const MIN_ROLE: Record<Permission, Role> = {
  'tender:view': 'VIEWER',
  'tender:create': 'ANALYST',
  'tender:update': 'ANALYST',
  'tender:delete': 'ADMIN',
  'tender:analyze': 'ANALYST',
  'decision:create': 'ADMIN',
  'proposal:view': 'VIEWER',
  'proposal:create': 'ANALYST',
  'proposal:update': 'ANALYST',
  'proposal:delete': 'ADMIN',
  'companyDoc:view': 'VIEWER',
  'companyDoc:manage': 'ANALYST',
  'task:view': 'VIEWER',
  'task:manage': 'ANALYST',
  'comment:create': 'ANALYST',
  'member:view': 'VIEWER',
  'member:invite': 'ADMIN',
  'member:remove': 'ADMIN',
  'member:role': 'OWNER',
  'billing:view': 'ADMIN',
  'billing:manage': 'OWNER',
  'workspace:update': 'ADMIN',
  'workspace:delete': 'OWNER',
};

/** True if `role` is allowed to perform `permission`. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[MIN_ROLE[permission]];
}

/** True if `role` is at least `minimum` in the hierarchy. */
export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export class ForbiddenError extends Error {
  constructor(public readonly permission: Permission) {
    super(`ليس لديك صلاحية لتنفيذ هذا الإجراء (${permission})`);
    this.name = 'ForbiddenError';
  }
}

/** Throws {@link ForbiddenError} when the role lacks the permission. */
export function requirePermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new ForbiddenError(permission);
}

/** All permissions granted to a role (handy for the client to hide UI). */
export function permissionsFor(role: Role): Permission[] {
  return PERMISSIONS.filter((p) => can(role, p));
}
