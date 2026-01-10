/**
 * LaunchPad Config Generator
 * 
 * Generates LoungeOps config (YAML/JSON) from LaunchPad progress
 */

import { LaunchPadProgress, LoungeOpsConfig } from '../../types/launchpad';

export function generateLoungeOpsConfig(
  progress: LaunchPadProgress
): LoungeOpsConfig {
  const step1 = progress.data.step1;
  const step2 = progress.data.step2;
  const step3 = progress.data.step3;
  const step4 = progress.data.step4;
  const step5 = progress.data.step5;

  if (!step1) {
    throw new Error('Step 1 (Venue Snapshot) data is required');
  }

  // Generate slug from lounge name
  const slug = step1.loungeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Separate standard and premium flavors
  const standardFlavors =
    step2?.topFlavors
      .filter((f) => !f.premium)
      .map((f) => ({
        name: f.name,
        price: f.priceCents ? f.priceCents / 100 : undefined,
      })) || [];

  const premiumFlavors =
    step2?.topFlavors
      .filter((f) => f.premium)
      .map((f) => ({
        name: f.name,
        price: (f.priceCents || 300) / 100, // Default $3.00 if not set
      })) || [];

  const config: LoungeOpsConfig = {
    lounge_name: step1.loungeName,
    slug,
    session_type: step3?.sessionType || 'flat',
    base_session_price: step1.baseSessionPrice / 100, // Convert cents to dollars
    grace_period_minutes: step3?.gracePeriodMinutes || 0,
    extension_policy: step3?.extensionPolicy || (step3?.sessionType === 'flat' ? 'na' : 'manual'),
    comp_policy_enabled: step3?.compPolicyEnabled || false,
    flavors: {
      standard: standardFlavors,
      premium: premiumFlavors,
    },
    staff:
      step4?.staff.map((s) => ({
        email: s.email,
        role: s.role,
      })) || [],
    pos_bridge: {
      pos_type: step5?.posType || 'none',
    },
    operating_hours: step1.operatingHours,
    tables_count: step1.tablesCount,
    sections_count: step1.sectionsCount || undefined,
  };

  return config;
}

/**
 * Export config as YAML string
 */
export function exportConfigAsYAML(config: LoungeOpsConfig): string {
  // Simple YAML generation (for production, use a proper YAML library)
  const lines: string[] = [];
  
  lines.push(`lounge_name: "${config.lounge_name}"`);
  lines.push(`slug: "${config.slug}"`);
  lines.push(`session_type: "${config.session_type}"`);
  lines.push(`base_session_price: ${config.base_session_price}`);
  lines.push(`grace_period_minutes: ${config.grace_period_minutes}`);
  lines.push(`extension_policy: "${config.extension_policy}"`);
  lines.push(`comp_policy_enabled: ${config.comp_policy_enabled}`);
  lines.push('');
  lines.push('flavors:');
  lines.push('  standard:');
  config.flavors.standard.forEach((f) => {
    if (f.price) {
      lines.push(`    - name: "${f.name}"`);
      lines.push(`      price: ${f.price}`);
    } else {
      lines.push(`    - name: "${f.name}"`);
    }
  });
  lines.push('  premium:');
  config.flavors.premium.forEach((f) => {
    lines.push(`    - name: "${f.name}"`);
    lines.push(`      price: ${f.price}`);
  });
  lines.push('');
  lines.push('staff:');
  config.staff.forEach((s) => {
    lines.push(`  - email: "${s.email}"`);
    lines.push(`    role: "${s.role}"`);
  });
  lines.push('');
  lines.push('pos_bridge:');
  lines.push(`  pos_type: "${config.pos_bridge.pos_type}"`);
  lines.push('');
  lines.push('operating_hours:');
  Object.entries(config.operating_hours).forEach(([day, hours]) => {
    if (hours) {
      lines.push(`  ${day}:`);
      lines.push(`    open: "${hours.open}"`);
      lines.push(`    close: "${hours.close}"`);
    } else {
      lines.push(`  ${day}: null`);
    }
  });
  lines.push(`tables_count: ${config.tables_count}`);
  if (config.sections_count) {
    lines.push(`sections_count: ${config.sections_count}`);
  }

  return lines.join('\n');
}

/**
 * Export config as JSON string
 */
export function exportConfigAsJSON(config: LoungeOpsConfig): string {
  return JSON.stringify(config, null, 2);
}

