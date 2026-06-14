import type { BidRecommendation } from '@bid-os/core';
import { cn } from '@/lib/utils';

const COLORS: Record<BidRecommendation, string> = {
  BID: '#22c08a',
  NO_BID: '#f87171',
  REVIEW: '#d4af37',
};

export function ScoreRing({
  score,
  recommendation = 'REVIEW',
  size = 128,
  className,
}: {
  score: number;
  recommendation?: BidRecommendation;
  size?: number;
  className?: string;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  const color = COLORS[recommendation];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-50">{score}</span>
        <span className="text-[11px] text-slate-400">من ١٠٠</span>
      </div>
    </div>
  );
}
