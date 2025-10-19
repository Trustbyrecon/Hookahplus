#!/usr/bin/env node

/**
 * Hookah+ Command Launcher
 * 
 * Command-line interface for Hookah+ agent orchestration and codex injection.
 * Provides easy access to the ReflexCodexInjector and agent management functions.
 * 
 * Usage:
 *   node cmd.js injectAgentCodex "ΔFlowConstant_LambdaInfinity"
 *   node cmd.js listCodex
 *   node cmd.js initializeEcosystem
 */

import { ReflexCodexInjector, cmd, Orchestrator } from './injectors/reflexCodexInjector.js';

class HookahCommandLauncher {
  private injector: ReflexCodexInjector;

  constructor() {
    this.injector = ReflexCodexInjector.getInstance();
  }

  /**
   * Main command handler
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];
    const params = args.slice(1);

    try {
      switch (command) {
        case 'injectAgentCodex':
          await this.handleInjectCodex(params);
          break;
        case 'listCodex':
          this.handleListCodex();
          break;
        case 'getCodex':
          this.handleGetCodex(params);
          break;
        case 'initializeEcosystem':
          await this.handleInitializeEcosystem();
          break;
        case 'batchInject':
          await this.handleBatchInject(params);
          break;
        case 'clearRegistry':
          this.handleClearRegistry();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  }

  /**
   * Handle codex injection command
   */
  private async handleInjectCodex(params: string[]): Promise<void> {
    if (params.length === 0) {
      console.error('❌ Usage: injectAgentCodex <injectionId> [options]');
      return;
    }

    const injectionId = params[0];
    const options: { expand?: string[]; resonanceLevel?: number } = {};

    // Parse additional options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      if (param.startsWith('--expand=')) {
        options.expand = param.split('=')[1].split(',');
      } else if (param.startsWith('--resonance=')) {
        options.resonanceLevel = parseInt(param.split('=')[1]);
      }
    }

    console.log(`🔮 Injecting codex: ${injectionId}`);
    const success = await cmd.injectAgentCodex(injectionId, options);
    
    if (success) {
      console.log('✅ Codex injection completed successfully');
    } else {
      console.log('❌ Codex injection failed');
      process.exit(1);
    }
  }

  /**
   * Handle list codex command
   */
  private handleListCodex(): void {
    const codexList = cmd.listCodex();
    
    if (codexList.length === 0) {
      console.log('📋 No codex registered');
      return;
    }

    console.log('📋 Registered Codex:');
    codexList.forEach(id => {
      console.log(`   • ${id}`);
    });
  }

  /**
   * Handle get codex command
   */
  private handleGetCodex(params: string[]): void {
    if (params.length === 0) {
      console.error('❌ Usage: getCodex <injectionId>');
      return;
    }

    const injectionId = params[0];
    const codex = cmd.getCodex(injectionId);

    if (!codex) {
      console.log(`❌ Codex not found: ${injectionId}`);
      return;
    }

    console.log(`📖 Codex Details: ${injectionId}`);
    console.log(`   Classification: ${codex.classification}`);
    console.log(`   Intent: ${codex.intent}`);
    console.log(`   Target Agents: ${codex.target_agents.join(', ')}`);
    console.log(`   Symbol: ${codex.payload.codex_meta.symbol}`);
    console.log(`   Codename: ${codex.payload.codex_meta.codename}`);
    console.log(`   Tier: ${codex.payload.codex_meta.tier}`);
    console.log(`   Signature: ${codex.payload.codex_meta.signature_phrase}`);
  }

  /**
   * Handle initialize ecosystem command
   */
  private async handleInitializeEcosystem(): Promise<void> {
    console.log('🚀 Initializing Hookah+ Agent Ecosystem...');
    await Orchestrator.initializeEcosystem();
    console.log('✅ Ecosystem initialization completed');
  }

  /**
   * Handle batch inject command
   */
  private async handleBatchInject(params: string[]): Promise<void> {
    if (params.length === 0) {
      console.error('❌ Usage: batchInject <injectionId1> [injectionId2] ...');
      return;
    }

    const injections = params.map(id => ({ injectionId: id }));
    console.log(`🔮 Batch injecting ${injections.length} codex...`);
    
    const results = await Orchestrator.batchInject(injections);
    const successCount = results.filter(r => r).length;
    
    console.log(`✅ Batch injection completed: ${successCount}/${injections.length} successful`);
  }

  /**
   * Handle clear registry command
   */
  private handleClearRegistry(): void {
    this.injector.clearRegistry();
    console.log('✅ Registry cleared');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🌊 Hookah+ Command Launcher

Available Commands:
  injectAgentCodex <injectionId> [options]  - Inject codex into agents
    Options:
      --expand=agent1,agent2               - Specify target agents
      --resonance=level                    - Set resonance level (1-5)

  listCodex                                - List all registered codex
  getCodex <injectionId>                  - Show codex details
  initializeEcosystem                     - Initialize Hookah+ ecosystem
  batchInject <id1> [id2] ...             - Inject multiple codex
  clearRegistry                           - Clear codex registry
  help                                    - Show this help

Examples:
  node cmd.js injectAgentCodex "ΔFlowConstant_LambdaInfinity"
  node cmd.js injectAgentCodex "ΔFlowConstant_LambdaInfinity" --expand=Aliethia,EchoPrime --resonance=2
  node cmd.js listCodex
  node cmd.js initializeEcosystem

🌊 Flow Constant (Λ∞) - Allow → Align → Amplify
    `);
  }
}

// Run the command launcher
if (import.meta.url === `file://${process.argv[1]}`) {
  const launcher = new HookahCommandLauncher();
  launcher.run().catch(console.error);
}

export default HookahCommandLauncher;
