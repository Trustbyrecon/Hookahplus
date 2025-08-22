// lib/commandLauncher.ts
// Command Launcher integration for Admin Control Center
// This file provides server-side command registration for automation

import { exec } from 'child_process';
import { promisify } from 'util';
import agentConsensus from './agentConsensus';

const execAsync = promisify(exec);

// Command registry type
type CommandRegistry = {
  [key: string]: (...args: any[]) => Promise<any>;
};

// HTTP client for API calls
async function httpCall(method: 'GET' | 'POST', url: string, data?: any) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`HTTP call failed: ${method} ${url}`, error);
    throw error;
  }
}

// Command implementations
export const adminCommands: CommandRegistry = {
  // Development commands
  "admin.dev": async (args: any = {}) => {
    console.log("🚀 Starting development server...");
    try {
      const { stdout, stderr } = await execAsync("pnpm dev");
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Failed to start dev server:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.build": async (args: any = {}) => {
    console.log("🔨 Building project...");
    try {
      const { stdout, stderr } = await execAsync("pnpm build");
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Build failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Reflex monitoring commands
  "admin.reflex.scan": async (args: any = {}) => {
    console.log("🔍 Running Reflex scan...");
    try {
      const result = await httpCall('POST', '/api/reflex/scan', args);
      return { success: true, result };
    } catch (error) {
      console.error("Reflex scan failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.reflex.calibrate.start": async (args: any = {}) => {
    console.log("⚡ Starting Reflex calibration...");
    try {
      const result = await httpCall('POST', '/api/reflex/calibration/start', args);
      return { success: true, result };
    } catch (error) {
      console.error("Calibration start failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.reflex.calibrate.stop": async (args: any = {}) => {
    console.log("⏸️ Stopping Reflex calibration...");
    try {
      const result = await httpCall('POST', '/api/reflex/calibration/stop', args);
      return { success: true, result };
    } catch (error) {
      console.error("Calibration stop failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Deployment commands
  "admin.deploy": async (args: any = {}) => {
    console.log("🚀 Triggering deployment...");
    try {
      const result = await httpCall('POST', '/api/deploy', args);
      return { success: true, result };
    } catch (error) {
      console.error("Deployment failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.rollback": async (args: any = {}) => {
    console.log("↩️ Triggering rollback...");
    try {
      const result = await httpCall('POST', '/api/deploy/rollback', args);
      return { success: true, result };
    } catch (error) {
      console.error("Rollback failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Status commands
  "admin.mvp.status": async (args: any = {}) => {
    console.log("📊 Fetching MVP status...");
    try {
      const result = await httpCall('GET', `/api/mvp/status?env=${args.env || 'staging'}`);
      return { success: true, result };
    } catch (error) {
      console.error("MVP status fetch failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Utility commands
  "admin.status": async () => {
    console.log("📋 Getting admin status...");
    try {
      const kpis = await httpCall('GET', '/api/admin/kpis?lounge=Pilot%20%23001&range=Last%207%20days');
      const mvp = await httpCall('GET', '/api/mvp/status?env=staging');
      return { success: true, kpis, mvp };
    } catch (error) {
      console.error("Status fetch failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.health": async () => {
    console.log("🏥 Running health check...");
    try {
      const checks = await Promise.allSettled([
        httpCall('GET', '/api/admin/kpis?lounge=Pilot%20%23001&range=Last%207%20days'),
        httpCall('GET', '/api/mvp/status?env=staging'),
        httpCall('GET', '/api/agent-consensus'),
      ]);
      
      const results = checks.map((check, index) => {
        const endpoints = ['KPIs', 'MVP Status', 'Agent Consensus'];
        if (check.status === 'fulfilled') {
          return { endpoint: endpoints[index], status: 'healthy', data: check.value };
        } else {
          return { endpoint: endpoints[index], status: 'unhealthy', error: check.reason };
        }
      });
      
      return { success: true, health: results };
    } catch (error) {
      console.error("Health check failed:", error);
      return { success: false, error: error.message };
    }
  },

  // New Agent Consensus Commands
  "admin.agents.status": async () => {
    console.log("🤖 Getting agent consensus status...");
    try {
      const state = agentConsensus.getState();
      return { success: true, state };
    } catch (error) {
      console.error("Agent status fetch failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.agents.trigger-order": async (args: any = {}) => {
    console.log("🛒 Triggering test order...");
    try {
      const orderData = {
        customerId: args.customerId || 'cmd_customer',
        flavor: args.flavor || 'Mint Storm',
        amount: args.amount || 32
      };
      
      agentConsensus.triggerOrder(orderData);
      return { success: true, message: 'Order triggered', orderData };
    } catch (error) {
      console.error("Order trigger failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.agents.pulse": async (args: any = {}) => {
    console.log(`📡 Sending manual pulse to ${args.agent}...`);
    try {
      const { agent, status, message, metadata } = args;
      
      if (!agent || !status) {
        throw new Error('Missing agent or status parameter');
      }
      
      switch (agent) {
        case 'aliethia':
          agentConsensus.aliethiaPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'ep':
          agentConsensus.epPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'navigator':
          agentConsensus.navigatorPulse(status, message || 'Manual pulse', metadata);
          break;
        case 'sentinel':
          agentConsensus.sentinelPulse(status, message || 'Manual pulse', metadata);
          break;
        default:
          throw new Error(`Invalid agent: ${agent}`);
      }
      
      return { success: true, message: `Pulse sent to ${agent}`, data: { agent, status, message, metadata } };
    } catch (error) {
      console.error("Manual pulse failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.agents.reset": async () => {
    console.log("🔄 Resetting agent consensus system...");
    try {
      // Note: This would require adding a reset method to the AgentConsensus class
      // For now, we'll just return the current state
      const state = agentConsensus.getState();
      return { success: true, message: 'Reset requested', currentState: state };
    } catch (error) {
      console.error("Agent reset failed:", error);
      return { success: false, error: error.message };
    }
  },

  "admin.agents.consensus": async () => {
    console.log("🤝 Checking agent consensus...");
    try {
      const state = agentConsensus.getState();
      const consensus = state.consensus;
      const activeAgents = Object.values(state.agents).filter(agent => agent.status === 'green').length;
      
      return { 
        success: true, 
        consensus, 
        activeAgents: `${activeAgents}/4`,
        reflexScore: state.reflexScore.score,
        cycleCount: state.cycleCount
      };
    } catch (error) {
      console.error("Consensus check failed:", error);
      return { success: false, error: error.message };
    }
  }
};

// Command executor
export async function executeCommand(command: string, args: any = {}) {
  if (!adminCommands[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  
  console.log(`Executing: ${command}`, args);
  return await adminCommands[command](args);
}

// Command list getter
export function getAvailableCommands(): string[] {
  return Object.keys(adminCommands);
}

// Command help
export function getCommandHelp(command?: string): any {
  if (command) {
    if (!adminCommands[command]) {
      return { error: `Unknown command: ${command}` };
    }
    
    const helpMap: { [key: string]: any } = {
      "admin.dev": { description: "Start development server", usage: "admin.dev()" },
      "admin.build": { description: "Build project", usage: "admin.build()" },
      "admin.reflex.scan": { description: "Run Reflex scan", usage: "admin.reflex.scan({ lounge, range })" },
      "admin.reflex.calibrate.start": { description: "Start Reflex calibration", usage: "admin.reflex.calibrate.start({ lounge })" },
      "admin.reflex.calibrate.stop": { description: "Stop Reflex calibration", usage: "admin.reflex.calibrate.stop({ lounge })" },
      "admin.deploy": { description: "Trigger deployment", usage: "admin.deploy({ env })" },
      "admin.rollback": { description: "Trigger rollback", usage: "admin.rollback({ env })" },
      "admin.mvp.status": { description: "Get MVP status", usage: "admin.mvp.status({ env })" },
      "admin.status": { description: "Get admin status", usage: "admin.status()" },
      "admin.health": { description: "Run health check", usage: "admin.health()" },
      "admin.agents.status": { description: "Get agent consensus status", usage: "admin.agents.status()" },
      "admin.agents.trigger-order": { description: "Trigger test order", usage: "admin.agents.trigger-order({ customerId, flavor, amount })" },
      "admin.agents.pulse": { description: "Send manual pulse", usage: "admin.agents.pulse({ agent, status, message, metadata })" },
      "admin.agents.reset": { description: "Reset agent system", usage: "admin.agents.reset()" },
      "admin.agents.consensus": { description: "Check consensus status", usage: "admin.agents.consensus()" }
    };
    
    return helpMap[command] || { error: "No help available for this command" };
  }
  
  return {
    available: getAvailableCommands(),
    categories: {
      "Development": ["admin.dev", "admin.build"],
      "Reflex System": ["admin.reflex.scan", "admin.reflex.calibrate.start", "admin.reflex.calibrate.stop"],
      "Deployment": ["admin.deploy", "admin.rollback"],
      "Monitoring": ["admin.mvp.status", "admin.status", "admin.health"],
      "Agent Consensus": ["admin.agents.status", "admin.agents.trigger-order", "admin.agents.pulse", "admin.agents.reset", "admin.agents.consensus"]
    }
  };
}
