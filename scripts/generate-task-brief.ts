#!/usr/bin/env tsx
/**
 * Task Brief Generator
 * 
 * Generates a task brief from user input using the Moat Spark Doctrine v2 template.
 * 
 * Usage:
 *   npx tsx scripts/generate-task-brief.ts "Task description"
 *   npx tsx scripts/generate-task-brief.ts --interactive
 *   npx tsx scripts/generate-task-brief.ts --from-file task-request.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface TaskBriefData {
  taskName: string;
  what: string;
  why: string;
  whoNeedsWhat: {
    inputs: string[];
    dependencies: string[];
    integrations: string[];
  };
  howVerified: string[];
  when: string;
  signals: {
    telemetry: {
      sentry: string[];
      pino: string[];
      reflex: string[];
    };
    metrics: string[];
    failureModes: Array<{
      type: 'primary' | 'secondary' | 'tertiary';
      description: string;
      alert: string;
      recovery: string;
    }>;
    evidenceLocation: string[];
  };
}

const TEMPLATE_PATH = path.join(__dirname, '..', 'TASK_BRIEF_TEMPLATE.md');
const OUTPUT_DIR = path.join(__dirname, '..', 'tasks');

function loadTemplate(): string {
  return fs.readFileSync(TEMPLATE_PATH, 'utf-8');
}

function generateTaskBrief(data: TaskBriefData): string {
  const template = loadTemplate();
  
  // Replace template placeholders with actual data
  let brief = template
    .replace(/\[Task Name\]/g, data.taskName)
    .replace(/\[Clear description of what needs to be done - 1-2 sentences\]/g, data.what)
    .replace(/\[Outcome\/impact - why this matters - 1-2 sentences\]/g, data.why)
    .replace(/\[What data\/components are needed as input\]/g, data.whoNeedsWhat.inputs.join('\n- '))
    .replace(/\[What systems\/components must exist first\]/g, data.whoNeedsWhat.dependencies.join('\n- '))
    .replace(/\[External systems or services that need to connect\]/g, data.whoNeedsWhat.integrations.join('\n- ') || 'None')
    .replace(/\[Acceptance criterion 1 - specific and testable\]/g, data.howVerified.join('\n- ✅ '))
    .replace(/\[Cadence\/deadline - e.g., "End of sprint", "This week", "P0 - Critical Path"\]/g, data.when);

  // Replace signals section
  const sentryEvents = data.signals.telemetry.sentry.map(e => `- ${e}`).join('\n');
  const pinoLogs = data.signals.telemetry.pino.map(l => `- ${l}`).join('\n');
  const reflexScores = data.signals.telemetry.reflex.map(r => `- ${r}`).join('\n');
  const metrics = data.signals.metrics.map(m => `- ${m}`).join('\n');
  
  const failureModes = data.signals.failureModes.map(fm => {
    return `**${fm.type.charAt(0).toUpperCase() + fm.type.slice(1)} Failure:**\n- **What breaks first:** ${fm.description}\n- **Alert fires:** ${fm.alert}\n- **Recovery:** ${fm.recovery}`;
  }).join('\n\n');
  
  const evidenceLocation = data.signals.evidenceLocation.map(e => `- ${e}`).join('\n');

  brief = brief.replace(
    /### Telemetry[\s\S]*?### Evidence Location/g,
    `### Telemetry

**Sentry Events:**
${sentryEvents}

**Pino Log Keys:**
${pinoLogs}

**Reflex Scoring:**
${reflexScores}

### Metrics

${metrics}

### Failure Modes

${failureModes}

### Evidence Location

${evidenceLocation}`
  );

  // Add metadata
  const metadata = `**Created:** ${new Date().toISOString().split('T')[0]}\n**Owner:** [Your Name]\n**Status:** [ ] Draft | [ ] In Progress | [ ] Complete`;
  brief = brief.replace(/\*\*Created:\*\* \[Date\]/g, metadata);

  return brief;
}

function saveTaskBrief(brief: string, taskName: string): string {
  // Create tasks directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Sanitize task name for filename
  const filename = taskName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  const filepath = path.join(OUTPUT_DIR, `${filename}-task-brief.md`);
  fs.writeFileSync(filepath, brief, 'utf-8');
  
  return filepath;
}

// Interactive mode
function interactiveMode(): TaskBriefData {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  return new Promise(async (resolve) => {
    console.log('📋 Task Brief Generator (Moat Spark Doctrine v2)\n');
    
    const taskName = await question('Task Name: ');
    const what = await question('What (1-2 sentences): ');
    const why = await question('Why (1-2 sentences): ');
    
    console.log('\nWho needs what:');
    const inputs = (await question('Inputs (comma-separated): ')).split(',').map(s => s.trim()).filter(Boolean);
    const dependencies = (await question('Dependencies (comma-separated): ')).split(',').map(s => s.trim()).filter(Boolean);
    const integrations = (await question('Integrations (comma-separated, or "none"): ')).split(',').map(s => s.trim()).filter(Boolean);
    
    console.log('\nHow it will be verified:');
    const howVerified: string[] = [];
    let criterion = await question('Acceptance criterion 1: ');
    while (criterion) {
      howVerified.push(criterion);
      criterion = await question('Acceptance criterion (or Enter to finish): ');
    }
    
    const when = await question('When (deadline): ');
    
    console.log('\nSignals to Instrument:');
    console.log('(You can fill these in later or use Aliethia to generate them)');
    const sentryEvents = (await question('Sentry events (comma-separated, or Enter to skip): ')).split(',').map(s => s.trim()).filter(Boolean);
    const pinoLogs = (await question('Pino log keys (comma-separated, or Enter to skip): ')).split(',').map(s => s.trim()).filter(Boolean);
    const reflexScores = (await question('Reflex scoring points (comma-separated, or Enter to skip): ')).split(',').map(s => s.trim()).filter(Boolean);
    const metrics = (await question('Metrics (comma-separated, or Enter to skip): ')).split(',').map(s => s.trim()).filter(Boolean);
    
    rl.close();
    
    resolve({
      taskName,
      what,
      why,
      whoNeedsWhat: {
        inputs,
        dependencies,
        integrations: integrations[0] === 'none' ? [] : integrations
      },
      howVerified,
      when,
      signals: {
        telemetry: {
          sentry: sentryEvents,
          pino: pinoLogs,
          reflex: reflexScores
        },
        metrics,
        failureModes: [],
        evidenceLocation: []
      }
    });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Task Brief Generator - Moat Spark Doctrine v2

Usage:
  npx tsx scripts/generate-task-brief.ts "Task description"
  npx tsx scripts/generate-task-brief.ts --interactive
  npx tsx scripts/generate-task-brief.ts --from-file task-request.md

Options:
  --interactive, -i    Interactive mode (prompts for all fields)
  --from-file, -f      Generate from a markdown file
  --help, -h           Show this help message

Note: For full observability signals, use Aliethia agent to generate complete task brief.
    `);
    process.exit(0);
  }
  
  if (args.includes('--interactive') || args.includes('-i')) {
    const data = await interactiveMode();
    const brief = generateTaskBrief(data);
    const filepath = saveTaskBrief(brief, data.taskName);
    console.log(`\n✅ Task brief generated: ${filepath}`);
    console.log('\n📝 Next steps:');
    console.log('1. Review and complete the "Signals to Instrument" section');
    console.log('2. Use Aliethia agent to generate full observability signals');
    console.log('3. Fill in DoD checklist as you work');
    console.log('4. Complete handoff summary when done');
  } else if (args.includes('--from-file') || args.includes('-f')) {
    const fileIndex = args.indexOf('--from-file') !== -1 ? args.indexOf('--from-file') : args.indexOf('-f');
    const filename = args[fileIndex + 1];
    if (!filename) {
      console.error('Error: --from-file requires a filename');
      process.exit(1);
    }
    console.log('⚠️  File parsing not yet implemented. Use --interactive or ask Aliethia to generate from your request.');
    process.exit(1);
  } else {
    // Simple mode: just task description
    const taskDescription = args.join(' ');
    if (!taskDescription) {
      console.error('Error: Task description required');
      process.exit(1);
    }
    
    console.log('⚠️  Simple mode: Generating basic task brief.');
    console.log('💡 For complete observability signals, ask Aliethia to generate the full task brief.\n');
    
    const data: TaskBriefData = {
      taskName: taskDescription,
      what: taskDescription,
      why: '[To be filled in]',
      whoNeedsWhat: {
        inputs: ['[To be filled in]'],
        dependencies: ['[To be filled in]'],
        integrations: []
      },
      howVerified: ['[To be filled in]'],
      when: '[To be filled in]',
      signals: {
        telemetry: {
          sentry: ['[To be generated by Aliethia]'],
          pino: ['[To be generated by Aliethia]'],
          reflex: ['[To be generated by Aliethia]']
        },
        metrics: ['[To be generated by Aliethia]'],
        failureModes: [],
        evidenceLocation: []
      }
    };
    
    const brief = generateTaskBrief(data);
    const filepath = saveTaskBrief(brief, taskDescription);
    console.log(`✅ Basic task brief generated: ${filepath}`);
    console.log('\n📝 Next steps:');
    console.log('1. Ask Aliethia: "Generate a complete task brief for: [your task description]"');
    console.log('2. Aliethia will generate full observability signals and Moat-aligned requirements');
    console.log('3. Review and approve the generated task brief');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateTaskBrief, TaskBriefData };

