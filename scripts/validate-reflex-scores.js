// scripts/validate-reflex-scores.js
// Validate reflex scores from test runs

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Reflex Scores...');

// Read reflex report
const reportPath = process.argv[2];
if (!reportPath || !fs.existsSync(reportPath)) {
  console.error('❌ Reflex report file not found');
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  // Validate report structure
  if (!report.timestamp || !report.agents || !report.systemHealth) {
    console.error('❌ Invalid reflex report structure');
    process.exit(1);
  }
  
  console.log('✅ Reflex report structure is valid');
  
  // Validate system health
  const { systemHealth } = report;
  if (systemHealth.overallHealth < 0.7) {
    console.error(`❌ System health too low: ${systemHealth.overallHealth}`);
    process.exit(1);
  }
  
  if (systemHealth.criticalIssues > 0) {
    console.error(`❌ Critical issues detected: ${systemHealth.criticalIssues}`);
    process.exit(1);
  }
  
  console.log('✅ System health validation passed');
  
  // Validate agent scores
  const agents = Object.values(report.agents);
  let failedAgents = 0;
  
  for (const agent of agents) {
    if (agent.averageScore < 0.8) {
      console.error(`❌ Agent ${agent.agentId} score too low: ${agent.averageScore}`);
      failedAgents++;
    }
    
    if (agent.failureRate > 0.1) {
      console.error(`❌ Agent ${agent.agentId} failure rate too high: ${agent.failureRate}`);
      failedAgents++;
    }
  }
  
  if (failedAgents > 0) {
    console.error(`❌ ${failedAgents} agents failed validation`);
    process.exit(1);
  }
  
  console.log('✅ All agent scores validation passed');
  
  // Validate gate decisions
  const entries = report.recentEntries || [];
  let invalidGates = 0;
  
  for (const entry of entries) {
    const { score, gateDecision } = entry;
    
    let expectedGate;
    if (score >= 0.92) {
      expectedGate = 'proceed';
    } else if (score >= 0.87) {
      expectedGate = 'recover';
    } else {
      expectedGate = 'halt';
    }
    
    if (gateDecision !== expectedGate) {
      console.error(`❌ Invalid gate decision for entry ${entry.id}: expected ${expectedGate}, got ${gateDecision}`);
      invalidGates++;
    }
  }
  
  if (invalidGates > 0) {
    console.error(`❌ ${invalidGates} invalid gate decisions found`);
    process.exit(1);
  }
  
  console.log('✅ All gate decisions validation passed');
  
  // Summary
  console.log('\n📊 Reflex Score Validation Summary:');
  console.log(`   System Health: ${(systemHealth.overallHealth * 100).toFixed(1)}%`);
  console.log(`   Active Agents: ${systemHealth.activeAgents}`);
  console.log(`   Critical Issues: ${systemHealth.criticalIssues}`);
  console.log(`   Trust Health: ${(systemHealth.trustGraphHealth * 100).toFixed(1)}%`);
  console.log(`   Recent Entries: ${entries.length}`);
  
  console.log('\n✅ All reflex score validations passed!');
  console.log('🎉 Reflex system is performing within acceptable parameters');
  
} catch (error) {
  console.error('❌ Error validating reflex scores:', error.message);
  process.exit(1);
}
