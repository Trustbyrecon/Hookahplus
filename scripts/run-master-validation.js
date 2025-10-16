#!/usr/bin/env node

/**
 * Master Validation Test Runner
 * Runs all comprehensive validation tests for the HookahPlus system
 * 
 * Run with: node scripts/run-master-validation.js
 */

const { runEnhancedStateMachineTests } = require('./test-enhanced-state-machine');
const { runCrossAppSyncTests } = require('./test-cross-app-sync');
const { runGuestIntelligenceTests } = require('./test-guest-intelligence');

// Master test results tracking
const masterResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  testSuites: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordMasterTest(name, passed, details = '') {
  masterResults.total++;
  if (passed) {
    masterResults.passed++;
    log(`PASS: ${name}`, 'success');
  } else {
    masterResults.failed++;
    log(`FAIL: ${name} - ${details}`, 'error');
  }
  
  masterResults.details.push({ name, passed, details });
}

// Test suite runner
async function runTestSuite(suiteName, testFunction) {
  log(`🧪 Starting ${suiteName}...`);
  
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    recordMasterTest(`${suiteName}`, result, `Duration: ${duration}ms`);
    
    masterResults.testSuites.push({
      name: suiteName,
      passed: result,
      duration: duration
    });
    
    return result;
  } catch (error) {
    recordMasterTest(`${suiteName}`, false, error.message);
    
    masterResults.testSuites.push({
      name: suiteName,
      passed: false,
      duration: 0,
      error: error.message
    });
    
    return false;
  }
}

// Main validation runner
async function runMasterValidation() {
  console.log('🚀 Starting Master Validation Test Suite\n');
  console.log('=' .repeat(100));
  console.log('🎯 COMPREHENSIVE VALIDATION OF HOOKAHPLUS SYSTEM');
  console.log('=' .repeat(100));
  
  const overallStartTime = Date.now();
  
  // Run all test suites
  const stateMachineResult = await runTestSuite('Enhanced State Machine Tests', runEnhancedStateMachineTests);
  const crossAppSyncResult = await runTestSuite('Cross-App Data Sync Tests', runCrossAppSyncTests);
  const guestIntelligenceResult = await runTestSuite('Guest Intelligence Dashboard Tests', runGuestIntelligenceTests);
  
  const overallEndTime = Date.now();
  const overallDuration = overallEndTime - overallStartTime;
  
  // Print master results
  console.log('\n' + '=' .repeat(100));
  console.log('📊 MASTER VALIDATION RESULTS');
  console.log('=' .repeat(100));
  console.log(`✅ Passed: ${masterResults.passed}`);
  console.log(`❌ Failed: ${masterResults.failed}`);
  console.log(`📈 Total:  ${masterResults.total}`);
  console.log(`⏱️  Overall Duration: ${overallDuration}ms`);
  console.log(`📊 Overall Success Rate: ${((masterResults.passed / masterResults.total) * 100).toFixed(1)}%`);
  
  // Test suite breakdown
  console.log('\n📋 TEST SUITE BREAKDOWN:');
  masterResults.testSuites.forEach(suite => {
    const status = suite.passed ? '✅' : '❌';
    const duration = suite.duration ? `${suite.duration}ms` : 'N/A';
    const error = suite.error ? ` - ${suite.error}` : '';
    console.log(`${status} ${suite.name} (${duration})${error}`);
  });
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  masterResults.details.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
  
  // Overall status and recommendations
  const allPassed = masterResults.failed === 0;
  console.log('\n' + '=' .repeat(100));
  
  if (allPassed) {
    console.log('🎉 ALL VALIDATION TESTS PASSED!');
    console.log('✅ Enhanced State Machine: 17 states, 16 actions validated');
    console.log('✅ Business Logic Framework: Tooltips and descriptions validated');
    console.log('✅ Role-Based Permissions: BOH/FOH/MANAGER/ADMIN validated');
    console.log('✅ Cross-App Data Sync: Guest → App → Site validated');
    console.log('✅ Domain Ecosystem: Seating metadata flow validated');
    console.log('✅ Guest Intelligence Dashboard: PII masking, trust scoring validated');
    console.log('✅ Behavioral Memory: Preferences, insights validated');
    console.log('✅ Operational Notes: Creation, retrieval validated');
    console.log('✅ API Endpoints: All endpoints accessible and functional');
    console.log('\n🚀 SYSTEM IS READY FOR PRODUCTION DEPLOYMENT!');
    console.log('🎯 HiTrust IN - All claims validated and verified');
  } else {
    console.log('⚠️  SOME VALIDATION TESTS FAILED!');
    console.log('❌ System is NOT ready for production deployment.');
    console.log('🔧 Fix failing tests before proceeding.');
    console.log('\n📋 FAILED TEST SUITES:');
    masterResults.testSuites
      .filter(suite => !suite.passed)
      .forEach(suite => {
        console.log(`❌ ${suite.name}${suite.error ? ` - ${suite.error}` : ''}`);
      });
    console.log('\n🎯 HiTrust OUT - Claims exceed validation coverage');
  }
  
  console.log('=' .repeat(100));
  
  // Production readiness assessment
  console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');
  console.log('=' .repeat(50));
  
  if (allPassed) {
    console.log('✅ READY FOR PRODUCTION');
    console.log('   • All core functionality validated');
    console.log('   • All API endpoints functional');
    console.log('   • All business logic verified');
    console.log('   • All security measures in place');
    console.log('   • All cross-app integrations working');
    console.log('\n🚀 DEPLOYMENT RECOMMENDATION: PROCEED');
  } else {
    console.log('❌ NOT READY FOR PRODUCTION');
    console.log('   • Critical functionality needs validation');
    console.log('   • Some API endpoints may be non-functional');
    console.log('   • Business logic may be incomplete');
    console.log('   • Security measures need verification');
    console.log('   • Cross-app integrations need testing');
    console.log('\n🔧 DEPLOYMENT RECOMMENDATION: FIX ISSUES FIRST');
  }
  
  console.log('=' .repeat(50));
  
  return allPassed;
}

// Run the master validation
if (require.main === module) {
  runMasterValidation()
    .then(success => {
      console.log(`\n🎯 Master Validation ${success ? 'PASSED' : 'FAILED'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Master validation error:', error);
      process.exit(1);
    });
}

module.exports = { runMasterValidation };
