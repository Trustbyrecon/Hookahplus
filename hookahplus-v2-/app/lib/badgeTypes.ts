export type EventType = "check_in" | "visit_closed" | "mix_ordered";

export type EventRecord = {
  id: string;
  ts: number;
  type: EventType;
  profileId: string;
  venueId?: string | null;
  comboHash?: string | null;
  staffId?: string | null;
};

export type Award = {
  id: string;
  profileId: string;
  badgeId: string;
  venueId?: string | null;
  progress: number;
  awardedAt: number;
  awardedBy?: string;
  revoked?: boolean;
};

export type BadgeConfig = {
  id: string;
  label: string;
  scope: string;
  rule: any;
  active?: boolean;
};
