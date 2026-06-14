import { describe, expect, it } from 'vitest';
import { can, ForbiddenError, permissionsFor, requirePermission, roleAtLeast } from './rbac';

describe('RBAC', () => {
  it('VIEWER can view but cannot create or analyze', () => {
    expect(can('VIEWER', 'tender:view')).toBe(true);
    expect(can('VIEWER', 'tender:create')).toBe(false);
    expect(can('VIEWER', 'tender:analyze')).toBe(false);
    expect(can('VIEWER', 'comment:create')).toBe(false);
  });

  it('ANALYST can create/analyze tenders but not delete them or record decisions', () => {
    expect(can('ANALYST', 'tender:create')).toBe(true);
    expect(can('ANALYST', 'tender:analyze')).toBe(true);
    expect(can('ANALYST', 'tender:delete')).toBe(false);
    expect(can('ANALYST', 'decision:create')).toBe(false);
  });

  it('ADMIN can delete tenders and record decisions but not manage billing or change roles', () => {
    expect(can('ADMIN', 'tender:delete')).toBe(true);
    expect(can('ADMIN', 'decision:create')).toBe(true);
    expect(can('ADMIN', 'member:invite')).toBe(true);
    expect(can('ADMIN', 'billing:manage')).toBe(false);
    expect(can('ADMIN', 'member:role')).toBe(false);
  });

  it('OWNER can do everything', () => {
    expect(can('OWNER', 'billing:manage')).toBe(true);
    expect(can('OWNER', 'member:role')).toBe(true);
    expect(can('OWNER', 'workspace:delete')).toBe(true);
  });

  it('roleAtLeast respects the hierarchy', () => {
    expect(roleAtLeast('ADMIN', 'ANALYST')).toBe(true);
    expect(roleAtLeast('ANALYST', 'ADMIN')).toBe(false);
    expect(roleAtLeast('OWNER', 'OWNER')).toBe(true);
  });

  it('requirePermission throws ForbiddenError when denied', () => {
    expect(() => requirePermission('VIEWER', 'tender:create')).toThrow(ForbiddenError);
    expect(() => requirePermission('OWNER', 'tender:create')).not.toThrow();
  });

  it('permissionsFor returns a non-empty subset that grows with rank', () => {
    expect(permissionsFor('VIEWER').length).toBeLessThan(permissionsFor('OWNER').length);
    expect(permissionsFor('OWNER')).toContain('workspace:delete');
  });
});
