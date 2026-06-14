import { prisma } from './client';

/**
 * Models that carry a `workspaceId` column and must be tenant-scoped.
 * Anything NOT in this set (User, Session, Plan, Workspace) is global / system.
 */
const TENANT_MODELS = new Set<string>([
  'Membership',
  'Subscription',
  'Invoice',
  'Payment',
  'UsageMeter',
  'Tender',
  'TenderDocument',
  'ExtractionRun',
  'Requirement',
  'Attachment',
  'Deadline',
  'RiskItem',
  'GapItem',
  'BidScore',
  'Proposal',
  'ProposalSection',
  'CompanyDocument',
  'DecisionLog',
  'Task',
  'Comment',
  'Notification',
  'AuditLog',
]);

/** Append-only models: updates/deletes are forbidden through the tenant client. */
const APPEND_ONLY = new Set<string>(['DecisionLog', 'AuditLog']);

/** Operations whose `where` clause should be constrained by `workspaceId`. */
const FILTER_OPS = new Set<string>([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

function mergeWhere(where: unknown, workspaceId: string): Record<string, unknown> {
  if (!where || typeof where !== 'object') return { workspaceId };
  const w = where as Record<string, unknown>;
  // Prisma 5 allows extra non-unique filters in unique `where` inputs, so this
  // is safe for findUnique/update/delete as well.
  return { ...w, workspaceId };
}

/**
 * Returns a Prisma client scoped to a single tenant (workspace). Every read is
 * filtered by `workspaceId`; every create stamps `workspaceId`; append-only
 * models reject mutations. This is the ONLY way app code should touch tenant data.
 */
export function forWorkspace(workspaceId: string) {
  if (!workspaceId) throw new Error('forWorkspace requires a workspaceId');

  return prisma.$extends({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          if (APPEND_ONLY.has(model) && /^(update|delete|upsert)/.test(operation)) {
            throw new Error(
              `[tenant] ${model} is append-only — "${operation}" is not permitted`,
            );
          }

          const a = (args ?? {}) as Record<string, unknown>;

          if (operation === 'create') {
            a.data = { ...(a.data as object), workspaceId };
          } else if (operation === 'createMany') {
            const data = a.data;
            const rows = Array.isArray(data) ? data : [data];
            a.data = rows.map((r) => ({ ...(r as object), workspaceId }));
          } else if (operation === 'upsert') {
            a.where = mergeWhere(a.where, workspaceId);
            a.create = { ...(a.create as object), workspaceId };
          } else if (FILTER_OPS.has(operation)) {
            a.where = mergeWhere(a.where, workspaceId);
          }

          return query(a);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forWorkspace>;
