import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        slate: 'bg-white/10 text-slate-200',
        gold: 'bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30',
        emerald: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
        amber: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
        red: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30',
        outline: 'border border-white/15 text-slate-300',
      },
    },
    defaultVariants: { variant: 'slate' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
