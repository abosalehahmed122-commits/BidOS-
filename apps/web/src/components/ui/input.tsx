import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-gold-400/40 focus:outline-none focus:ring-2 focus:ring-gold-400/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-gold-400/40 focus:outline-none focus:ring-2 focus:ring-gold-400/20',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-slate-300', className)} {...props} />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-navy-900 px-4 text-sm text-slate-100 focus:border-gold-400/40 focus:outline-none focus:ring-2 focus:ring-gold-400/20',
        className,
      )}
      {...props}
    />
  );
}
