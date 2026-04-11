import type { LoungeOpsConfig } from '../../types/launchpad';

export const HPLUS_LITE_STARTER_FLAVORS = [
  'Blue Mist',
  'Mint',
  'Double Apple',
  'Love 66',
  'Peach',
] as const;

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export type LiteLoungeSeedInput = {
  name: string;
  city?: string;
  tableCount: number;
  basePriceDollars: number;
  flavors: string[];
  premiumFlavorNames?: string[];
  premiumAddonDollars?: number;
};

export type LiteLoungeStoredConfig = LoungeOpsConfig & {
  city?: string;
  source: 'hplus_lite';
};

export function buildLiteLoungeOpsConfig(input: LiteLoungeSeedInput): LiteLoungeStoredConfig {
  const trimmedName = input.name.trim() || 'My Lounge';
  const rawFlavors =
    input.flavors.map((f) => f.trim()).filter(Boolean);
  const flavorNames = rawFlavors.length > 0 ? rawFlavors : [...HPLUS_LITE_STARTER_FLAVORS];

  const premiumNames = (input.premiumFlavorNames || [])
    .map((n) => n.trim())
    .filter(Boolean);
  const premiumPrice = input.premiumAddonDollars ?? 5;

  return {
    lounge_name: trimmedName,
    slug: slugify(trimmedName) || 'lounge',
    session_type: 'flat',
    base_session_price: input.basePriceDollars,
    grace_period_minutes: 0,
    extension_policy: 'na',
    comp_policy_enabled: false,
    flavors: {
      standard: flavorNames.map((name) => ({ name })),
      premium: premiumNames.map((name) => ({ name, price: premiumPrice })),
    },
    common_mixes: [],
    staff: [],
    pos_bridge: { pos_type: 'none', usage_mode: 'alongside' },
    operating_hours: {},
    tables_count: input.tableCount,
    city: input.city?.trim() || undefined,
    source: 'hplus_lite',
  };
}
