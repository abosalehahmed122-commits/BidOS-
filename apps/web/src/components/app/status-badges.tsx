import {
  BID_RECOMMENDATION_LABELS,
  RISK_SEVERITY_LABELS,
  TENDER_STATUS_LABELS,
  type BidRecommendation,
  type RiskSeverity,
  type TenderStatus,
} from '@bid-os/core';
import { Badge } from '@/components/ui/badge';

type Variant = 'slate' | 'gold' | 'emerald' | 'amber' | 'red' | 'outline';

const STATUS_VARIANT: Record<TenderStatus, Variant> = {
  NEW: 'slate',
  UNDER_REVIEW: 'amber',
  DECIDED_BID: 'emerald',
  DECIDED_NO_BID: 'red',
  SUBMITTED: 'gold',
  WON: 'emerald',
  LOST: 'red',
  ARCHIVED: 'slate',
};

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{TENDER_STATUS_LABELS[status]}</Badge>;
}

const REC_VARIANT: Record<BidRecommendation, Variant> = {
  BID: 'emerald',
  NO_BID: 'red',
  REVIEW: 'gold',
};

export function RecommendationBadge({ rec }: { rec: BidRecommendation }) {
  return <Badge variant={REC_VARIANT[rec]}>{BID_RECOMMENDATION_LABELS[rec]}</Badge>;
}

const SEV_VARIANT: Record<RiskSeverity, Variant> = {
  LOW: 'slate',
  MEDIUM: 'amber',
  HIGH: 'red',
  CRITICAL: 'red',
};

export function SeverityBadge({ sev }: { sev: RiskSeverity }) {
  return <Badge variant={SEV_VARIANT[sev]}>{RISK_SEVERITY_LABELS[sev]}</Badge>;
}
