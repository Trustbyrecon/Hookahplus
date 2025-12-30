#!/usr/bin/env tsx
/**
 * Sentry Alerts Provisioning Script
 * 
 * Creates Sentry alert rules via REST API
 * Idempotent: checks if alerts exist before creating
 * 
 * Usage:
 *   tsx scripts/sentry-alerts.ts
 *   tsx scripts/sentry-alerts.ts --dry-run
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SENTRY_ORG = 'hookahplusnet';
const SENTRY_BASE_URL = 'https://sentry.io/api/0';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

const DRY_RUN = process.argv.includes('--dry-run');

interface AlertCondition {
  id: string;
  value?: string | number;
  match?: string;
  level?: string;
  key?: string;
  interval?: string;
  attribute?: string;
}

interface AlertAction {
  id: string;
  service?: string;
  workspace?: string;
  channel?: string;
  targetType?: string;
}

interface AlertConfig {
  name: string;
  project: string;
  actionMatch: 'all' | 'any';
  frequency: number; // minutes, minimum 5
  conditions: AlertCondition[];
  filters?: AlertCondition[]; // Filters for level, tags, attributes
  actions: AlertAction[];
}

// Alert configurations
const ALERT_CONFIGS: AlertConfig[] = [
  // Critical Production Errors - App
  {
    name: 'Critical Production Errors',
    project: 'javascript-nextjs-app',
    actionMatch: 'all',
    frequency: 5, // Minimum 5 minutes (closest to "every occurrence")
    conditions: [], // No conditions, using filters instead
    filters: [
      {
        id: 'sentry.rules.filters.level.LevelFilter',
        match: 'gte',
        level: '40' // 40 = error level
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // Critical Production Errors - Guests
  {
    name: 'Critical Production Errors',
    project: 'javascript-nextjs-guest',
    actionMatch: 'all',
    frequency: 5,
    conditions: [],
    filters: [
      {
        id: 'sentry.rules.filters.level.LevelFilter',
        match: 'gte',
        level: '40'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // New Issue Detected - App
  {
    name: 'New Issue Detected',
    project: 'javascript-nextjs-app',
    actionMatch: 'all',
    frequency: 60, // Once per hour
    conditions: [
      {
        id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // New Issue Detected - Guests
  {
    name: 'New Issue Detected',
    project: 'javascript-nextjs-guest',
    actionMatch: 'all',
    frequency: 60,
    conditions: [
      {
        id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // Payment-Related Errors - App
  {
    name: 'Payment-Related Errors',
    project: 'javascript-nextjs-app',
    actionMatch: 'all',
    frequency: 5,
    conditions: [],
    filters: [
      {
        id: 'sentry.rules.filters.level.LevelFilter',
        match: 'gte',
        level: '40'
      },
      {
        id: 'sentry.rules.filters.tagged_event.TaggedEventFilter',
        key: 'component',
        match: 'eq',
        value: 'payment'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // Database Connection Errors - App
  {
    name: 'Database Connection Errors',
    project: 'javascript-nextjs-app',
    actionMatch: 'all',
    frequency: 5, // Once per 5 minutes
    conditions: [],
    filters: [
      {
        id: 'sentry.rules.filters.event_attribute.EventAttributeFilter',
        attribute: 'message',
        match: 'co', // "co" = contains
        value: 'database'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  },
  // Authentication Failures - App
  {
    name: 'Authentication Failures',
    project: 'javascript-nextjs-app',
    actionMatch: 'all',
    frequency: 60, // Once per hour
    conditions: [],
    filters: [
      {
        id: 'sentry.rules.filters.event_attribute.EventAttributeFilter',
        attribute: 'message',
        match: 'co', // "co" = contains
        value: 'authentication'
      }
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event.NotifyEventAction',
        targetType: 'IssueOwners'
      }
    ]
  }
];

async function fetchSentryAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${SENTRY_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sentry API error (${response.status}): ${error}`);
  }

  return response.json();
}

async function listProjects(): Promise<any[]> {
  try {
    const projects = await fetchSentryAPI(`/organizations/${SENTRY_ORG}/projects/`);
    return projects || [];
  } catch (error: any) {
    console.error('Failed to list projects:', error.message);
    return [];
  }
}

async function getExistingAlerts(project: string): Promise<any[]> {
  try {
    const alerts = await fetchSentryAPI(
      `/projects/${SENTRY_ORG}/${project}/rules/`
    );
    return alerts || [];
  } catch (error: any) {
    if (error.message.includes('404')) {
      return [];
    }
    throw error;
  }
}

async function createAlert(config: AlertConfig): Promise<void> {
  const { project, name, actionMatch, frequency, conditions, actions } = config;

  // Check if alert already exists
  const existingAlerts = await getExistingAlerts(project);
  const existing = existingAlerts.find((alert: any) => alert.name === name);

  if (existing) {
    console.log(`✅ Alert "${name}" already exists in ${project} (ID: ${existing.id})`);
    return;
  }

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create alert "${name}" in ${project}`);
    console.log(`  Conditions: ${conditions.length}`);
    console.log(`  Actions: ${actions.length}`);
    console.log(`  Frequency: ${frequency === 0 ? 'Every occurrence' : `Once per ${frequency} minutes`}`);
    return;
  }

  // Create the alert
  const payload: any = {
    name,
    actionMatch,
    frequency,
    conditions,
    actions
  };

  // Add filters if provided
  if (config.filters && config.filters.length > 0) {
    payload.filters = config.filters;
    payload.filterMatch = 'all'; // Match all filters
  }

  try {
    const result = await fetchSentryAPI(
      `/projects/${SENTRY_ORG}/${project}/rules/`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    console.log(`✅ Created alert "${name}" in ${project} (ID: ${result.id})`);
  } catch (error: any) {
    console.error(`❌ Failed to create alert "${name}" in ${project}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Sentry Alerts Provisioning Script\n');
  console.log(`Organization: ${SENTRY_ORG}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (will create alerts)'}\n`);

  if (!SENTRY_AUTH_TOKEN) {
    console.error('❌ SENTRY_AUTH_TOKEN environment variable is required');
    console.error('');
    console.error('Get your token from: https://sentry.io/settings/account/api/auth-tokens/');
    console.error('');
    console.error('Set it with: export SENTRY_AUTH_TOKEN="your-token-here"');
    console.error('Or add to .env file and load with: source .env');
    process.exit(1);
  }

  // List available projects to help debug
  console.log('📋 Checking available projects...\n');
  try {
    const projects = await listProjects();
    console.log(`Found ${projects.length} project(s):`);
    projects.forEach((p: any) => {
      console.log(`  - ${p.slug} (${p.name})`);
    });
    console.log('');
  } catch (error: any) {
    console.warn('⚠️  Could not list projects:', error.message);
    console.log('');
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const config of ALERT_CONFIGS) {
    try {
      const existing = await getExistingAlerts(config.project);
      const exists = existing.some((alert: any) => alert.name === config.name);

      if (exists && !DRY_RUN) {
        skipCount++;
        continue;
      }

      await createAlert(config);
      if (!DRY_RUN && !exists) {
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Error processing "${config.name}" for ${config.project}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  if (!DRY_RUN) {
    console.log(`  ✅ Created: ${successCount}`);
    console.log(`  ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
  } else {
    console.log(`  📋 Would create: ${ALERT_CONFIGS.length} alerts`);
  }

  console.log('\n🔍 View alerts at:');
  console.log(`  https://sentry.io/organizations/${SENTRY_ORG}/alerts/rules/`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);

