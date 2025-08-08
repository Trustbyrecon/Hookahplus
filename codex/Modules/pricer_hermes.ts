import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';

interface FlavorConfig {
  premium: boolean;
  addon: number;
}

interface PricingConfig {
  base_price: number;
  flavors: Record<string, FlavorConfig>;
  session_lengths: Record<number, number>;
}

export interface PriceBreakdown {
  base: number;
  addon: number;
  total: number;
}

export interface PricingResult {
  breakdown: PriceBreakdown;
  metadata: Record<string, any>;
  alerts: string[];
}

export function priceSession(flavor: string, sessionLength: number, configPath = 'configs/lounge_pricing.yaml'): PricingResult {
  const absPath = path.resolve(configPath);
  const file = fs.readFileSync(absPath, 'utf8');
  const config = YAML.parse(file) as PricingConfig;

  const alerts: string[] = [];

  // Determine base price based on session length
  let base = config.base_price;
  if (config.session_lengths && config.session_lengths[sessionLength]) {
    base = config.session_lengths[sessionLength];
  } else {
    alerts.push(`session length ${sessionLength} not configured`);
  }

  // Determine flavor addon and premium flag
  let addon = 0;
  let premium = false;
  const flavorInfo = config.flavors[flavor];
  if (flavorInfo) {
    addon = flavorInfo.addon;
    premium = flavorInfo.premium;
  } else {
    alerts.push(`flavor ${flavor} not configured`);
  }

  const total = base + addon;

  const metadata = {
    flavor,
    premium,
    sessionLength,
    base,
    addon,
    total,
  };

  return {
    breakdown: { base, addon, total },
    metadata,
    alerts,
  };
}

export default priceSession;
