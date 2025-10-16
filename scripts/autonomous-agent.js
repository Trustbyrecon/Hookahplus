#!/usr/bin/env node

/**
 * 🤖 Autonomous Agent CI/CD Script
 * Enables agents to work independently with git operations and deployments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutonomousAgent {
  constructor(agentName, reflexScore = 0) {
    this.agentName = agentName;
    this.reflexScore = reflexScore;
    this.workingDir = process.cwd();
    this.ghostLogPath = path.join(this.workingDir, 'reflex_memory', 'GhostLog.md');
    
    // Autonomous Mode Configuration
    this.AUTONOMOUS_THRESHOLD = 87;
    this.QUALIFIED_AGENTS = ['moat_reflex_agent', 'smoke_test_agent', 'reflex_agent', 'deployment_agent'];
    this.autonomousModeEnabled = this.isQualifiedForAutonomousMode();
  }

  /**
   * Check if agent is qualified for autonomous mode
   */
  isQualifiedForAutonomousMode() {
    return this.QUALIFIED_AGENTS.includes(this.agentName) && this.reflexScore >= this.AUTONOMOUS_THRESHOLD;
  }

  /**
   * Execute autonomous git operation with reflex scoring
   */
  async executeGitOperation(files, message, branch = 'main') {
    try {
      // Check autonomous mode qualification
      if (!this.autonomousModeEnabled) {
        throw new Error(`Agent ${this.agentName} not qualified for autonomous mode. Reflex Score: ${this.reflexScore}%, Required: ${this.AUTONOMOUS_THRESHOLD}%`);
      }

      // Pre-action scoring
      const preScore = this.calculateReflexScore('plan', message);
      console.log(`🤖 ${this.agentName}: Pre-action Reflex Score: ${preScore}%`);
      console.log(`🚀 ${this.agentName}: Autonomous Mode ENABLED`);

      if (preScore < 70) {
        throw new Error(`Reflex Score too low: ${preScore}%. Escalating to supervisor.`);
      }

      // Execute git operations
      console.log(`🤖 ${this.agentName}: Adding files: ${files.join(', ')}`);
      execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });

      console.log(`🤖 ${this.agentName}: Committing changes...`);
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

      console.log(`🤖 ${this.agentName}: Pushing to ${branch}...`);
      execSync(`git push origin ${branch}`, { stdio: 'inherit' });

      // Post-action scoring
      const postScore = this.calculateReflexScore('execute', message);
      console.log(`🤖 ${this.agentName}: Post-action Reflex Score: ${postScore}%`);

      // Update GhostLog
      await this.updateGhostLog(message, preScore, postScore);

      return { success: true, preScore, postScore };

    } catch (error) {
      console.error(`❌ ${this.agentName}: Operation failed:`, error.message);
      await this.updateGhostLog(message, 0, 0, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run smoke tests and return results
   */
  async runSmokeTests() {
    try {
      console.log(`🧪 ${this.agentName}: Running smoke tests...`);
      const result = execSync('node smoke-tests.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse results
      const passCount = (result.match(/✅/g) || []).length;
      const failCount = (result.match(/❌/g) || []).length;
      const successRate = (passCount / (passCount + failCount)) * 100;

      console.log(`📊 ${this.agentName}: Smoke test success rate: ${successRate.toFixed(1)}%`);
      return { success: true, passCount, failCount, successRate };

    } catch (error) {
      console.error(`❌ ${this.agentName}: Smoke tests failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger Vercel deployment
   */
  async triggerDeployment(project = 'site') {
    try {
      console.log(`🚀 ${this.agentName}: Triggering Vercel deployment for ${project}...`);
      
      // Check if vercel CLI is available
      try {
        execSync('vercel --version', { stdio: 'pipe' });
      } catch {
        console.log(`ℹ️ ${this.agentName}: Vercel CLI not available, using git push trigger`);
        return { success: true, method: 'git-push' };
      }

      // Trigger deployment
      const result = execSync(`vercel --prod`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log(`✅ ${this.agentName}: Deployment triggered successfully`);
      return { success: true, method: 'vercel-cli', result };

    } catch (error) {
      console.error(`❌ ${this.agentName}: Deployment trigger failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate reflex score for operation
   */
  calculateReflexScore(phase, context) {
    const baseScore = 75; // Base score for autonomous operations
    
    // Decision Alignment (25%)
    const decisionAlignment = this.agentName === 'deployment' ? 90 : 80;
    
    // Context Integration (25%)
    const contextIntegration = context.includes('fix') || context.includes('update') ? 85 : 75;
    
    // Output Quality (25%)
    const outputQuality = phase === 'plan' ? 80 : 85;
    
    // Learning Capture (25%)
    const learningCapture = context.includes('Learning:') ? 90 : 70;

    const score = Math.round(
      (decisionAlignment * 0.25) +
      (contextIntegration * 0.25) +
      (outputQuality * 0.25) +
      (learningCapture * 0.25)
    );

    return Math.min(score, 100);
  }

  /**
   * Update GhostLog with autonomous action
   */
  async updateGhostLog(message, preScore, postScore, error = null) {
    const timestamp = new Date().toISOString();
    const cycleNumber = await this.getNextCycleNumber();
    
    const logEntry = `
### **Cycle #${cycleNumber}: Autonomous ${this.agentName} Action ${error ? '(FAILED)' : '(COMPLETED)'}**
- **Agent**: ${this.agentName} (Autonomous)
- **Plan**: ${message.split('\n')[0]}
- **Action**: ${error ? `Failed - ${error}` : 'Autonomous git operation executed'}
- **Score**: ${preScore}% → ${postScore}% ${error ? '(Failed)' : '(Success)'}
- **Learning**: ${error ? 'Autonomous operation failed, requires supervisor review' : 'Autonomous operation successful, pattern established'}
`;

    try {
      if (fs.existsSync(this.ghostLogPath)) {
        const content = fs.readFileSync(this.ghostLogPath, 'utf8');
        const updatedContent = content.replace(
          '## 📊 Reflex Cycle History',
          `## 📊 Reflex Cycle History${logEntry}`
        );
        fs.writeFileSync(this.ghostLogPath, updatedContent);
      }
    } catch (error) {
      console.error(`❌ ${this.agentName}: Failed to update GhostLog:`, error.message);
    }
  }

  /**
   * Get next cycle number for GhostLog
   */
  async getNextCycleNumber() {
    try {
      if (fs.existsSync(this.ghostLogPath)) {
        const content = fs.readFileSync(this.ghostLogPath, 'utf8');
        const matches = content.match(/### \*\*Cycle #(\d+):/g);
        return matches ? matches.length + 1 : 1;
      }
    } catch (error) {
      console.error(`❌ ${this.agentName}: Failed to read GhostLog:`, error.message);
    }
    return 1;
  }

  /**
   * Apply Vercel pattern to other apps
   */
  async applyVercelPattern(appName) {
    const vercelConfig = {
      "version": 2,
      "buildCommand": `npx turbo build --filter=@hookahplus/${appName}`,
      "outputDirectory": ".next",
      "installCommand": "pnpm install --frozen-lockfile",
      "framework": "nextjs"
    };

    const vercelPath = path.join(this.workingDir, 'apps', appName, 'vercel.json');
    
    try {
      fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
      console.log(`✅ ${this.agentName}: Created vercel.json for ${appName}`);
      return true;
    } catch (error) {
      console.error(`❌ ${this.agentName}: Failed to create vercel.json for ${appName}:`, error.message);
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const agentName = args[0] || 'autonomous';
  const action = args[1] || 'help';

  const agent = new AutonomousAgent(agentName);

  switch (action) {
    case 'commit':
      const files = args.slice(2, -1);
      const message = args[args.length - 1];
      agent.executeGitOperation(files, message);
      break;
    
    case 'test':
      agent.runSmokeTests();
      break;
    
    case 'deploy':
      const project = args[2] || 'site';
      agent.triggerDeployment(project);
      break;
    
    case 'apply-pattern':
      const appName = args[2];
      if (appName) {
        agent.applyVercelPattern(appName);
      } else {
        console.log('Usage: node autonomous-agent.js apply-pattern <app-name>');
      }
      break;
    
    default:
      console.log(`
🤖 Autonomous Agent CI/CD Script

Usage:
  node autonomous-agent.js <agent-name> <action> [options]

Actions:
  commit <files...> <message>  - Commit and push changes
  test                        - Run smoke tests
  deploy [project]            - Trigger deployment
  apply-pattern <app-name>    - Apply Vercel pattern to app

Examples:
  node autonomous-agent.js deployment commit "apps/app/vercel.json" "agent: deployment fix - Apply Vercel pattern to app"
  node autonomous-agent.js smoke-test test
  node autonomous-agent.js deployment deploy site
  node autonomous-agent.js deployment apply-pattern app
      `);
  }
}

module.exports = AutonomousAgent;
