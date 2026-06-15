import { forWorkspace, prisma } from '@bid-os/db';

export interface PlanLimits {
  tendersPerMonth: number;
  aiPagesPerMonth: number;
  seats: number;
  storageBytes: number;
  proposalsPerMonth: number;
}

export type Metric = 'AI_PAGES' | 'TENDERS_ANALYZED' | 'PROPOSALS_GENERATED' | 'STORAGE_BYTES' | 'SEATS';

const DEFAULT_LIMITS: PlanLimits = {
  tendersPerMonth: 0,
  aiPagesPerMonth: 0,
  seats: 1,
  storageBytes: 0,
  proposalsPerMonth: 0,
};

export function currentPeriod(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getBillingContext(ws: string) {
  const sub = await prisma.subscription.findUnique({
    where: { workspaceId: ws },
    include: { plan: true },
  });
  const limits = { ...DEFAULT_LIMITS, ...((sub?.plan.limits as object | undefined) ?? {}) } as PlanLimits;
  return { sub, plan: sub?.plan ?? null, limits };
}

export async function getUsage(ws: string, period = currentPeriod()): Promise<Record<string, number>> {
  const rows = await forWorkspace(ws).usageMeter.findMany({ where: { period } });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.metric] = r.value;
  return map;
}

export async function incrementUsage(ws: string, metric: Metric, amount = 1, period = currentPeriod()) {
  await prisma.usageMeter.upsert({
    where: { workspaceId_metric_period: { workspaceId: ws, metric, period } },
    create: { workspaceId: ws, metric, period, value: amount },
    update: { value: { increment: amount } },
  });
}

/**
 * Atomically check a usage limit and increment if allowed.
 * Returns true when the action is permitted (limit < 0 means unlimited).
 */
export async function consume(
  ws: string,
  metric: Metric,
  amount: number,
  limit: number,
  period = currentPeriod(),
): Promise<boolean> {
  if (limit >= 0) {
    const usage = await getUsage(ws, period);
    if ((usage[metric] ?? 0) + amount > limit) return false;
  }
  await incrementUsage(ws, metric, amount, period);
  return true;
}
