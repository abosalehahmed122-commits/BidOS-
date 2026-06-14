import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon className="h-5 w-5 text-gold-400" />
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
