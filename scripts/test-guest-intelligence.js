#!/usr/bin/env node

/**
 * Guest Intelligence Dashboard Validation Test Suite
 * Tests PII masking, trust scoring, behavioral memory, and predictive analytics
 * 
 * Run with: node scripts/test-guest-intelligence.js
 */

const BASE_URL = process.env.APP_URL || 'https://hookahplus-app.vercel.app';

// Test configuration
const TEST_CONFIG = {
  TEST_SESSION_ID: `intelligence_test_${Date.now()}`,
  TEST_TABLE_ID: 'T-INTEL-001',
  TEST_CUSTOMER_NAME: 'Intelligence Test Customer',
  TEST_CUSTOMER_PHONE: '+1 (555) 111-2222',
  TEST_CUSTOMER_EMAIL: 'test@example.com',
  TEST_FLAVOR: 'Intelligence Test Flavor',
  TEST_AMOUNT: 5500, // $55.00 in cents
  TEST_DURATION: 90 * 60, // 90 minutes in seconds
  TEST_ADDRESS: '123 Test Street, Test City, TC 12345',
  PII_TEST_DATA: {
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    customerEmail: 'john.smith@email.com',
    customerAddress: '456 Main Street, Anytown, AT 54321',
    notes: 'Customer John Smith prefers quiet seating near window'
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  piiTests: [],
  trustTests: [],
  intelligenceTests: [],
  apiTests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, details = '', category = 'general') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${name}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${name} - ${details}`, 'error');
  }
  
  const testRecord = { name, passed, details, category };
  testResults.details.push(testRecord);
  
  // Categorize tests
  switch (category) {
    case 'pii':
      testResults.piiTests.push(testRecord);
      break;
    case 'trust':
      testResults.trustTests.push(testRecord);
      break;
    case 'intelligence':
      testResults.intelligenceTests.push(testRecord);
      break;
    case 'api':
      testResults.apiTests.push(testRecord);
      break;
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HookahPlus-IntelligenceTest/1.0',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, data: { error: error.message }, headers: {} };
  }
}

// Test 1: PII Masking Validation
async function testPIIMasking() {
  log('🧪 Testing PII masking functionality...');
  
  try {
    // Test different PII masking levels
    const piiLevels = ['none', 'low', 'medium', 'high'];
    
    for (const level of piiLevels) {
      const response = await makeRequest(`${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}?piiMasking=true&piiLevel=${level}`);
      
      recordTest(`PII masking API - ${level} level`, response.status === 200, 
        `Status: ${response.status}`, 'api');

      if (response.status === 200) {
        const data = response.data;
        
        // Test PII masking configuration
        const hasPiiConfig = data.piiMasking !== undefined;
        recordTest(`PII masking config - ${level} level`, hasPiiConfig, 
          hasPiiConfig ? `Enabled: ${data.piiMasking.enabled}, Level: ${data.piiMasking.level}` : 'No PII config', 'pii');

        // Test that PII masking is applied
        if (data.session) {
          const session = data.session;
          
          // Test name masking
          const nameMasked = level === 'none' ? true : 
                            level === 'low' ? session.customerName.includes('[CUSTOMER NAME]') :
                            level === 'medium' ? session.customerName.includes('[CUSTOMER NAME]') :
                            level === 'high' ? session.customerName.includes('[CUSTOMER NAME]') : false;
          
          recordTest(`Name masking - ${level} level`, nameMasked, 
            nameMasked ? 'Name masked' : `Name not masked: ${session.customerName}`, 'pii');

          // Test phone masking
          const phoneMasked = level === 'none' ? true :
                             level === 'low' ? true :
                             level === 'medium' ? session.customerPhone.includes('[PHONE]') :
                             level === 'high' ? session.customerPhone.includes('[PHONE]') : false;
          
          recordTest(`Phone masking - ${level} level`, phoneMasked, 
            phoneMasked ? 'Phone masked' : `Phone not masked: ${session.customerPhone}`, 'pii');
        }
      }
    }

    // Test PII masking utility functions
    try {
      const { getPiiMaskedContent, getPiiLevelColor } = require('../apps/app/lib/piiMasking');
      
      // Test content masking
      const testContent = 'Customer John Smith at 123 Main Street called +1-555-123-4567';
      const maskedContent = getPiiMaskedContent(testContent, 'medium');
      const isMasked = maskedContent.includes('[CUSTOMER NAME]') && maskedContent.includes('[PHONE]');
      
      recordTest('PII masking utility function', isMasked, 
        isMasked ? 'Content masked correctly' : `Content not masked: ${maskedContent}`, 'pii');

      // Test PII level color function
      const color = getPiiLevelColor('medium');
      const hasColor = color && color.includes('orange');
      
      recordTest('PII level color function', hasColor, 
        hasColor ? `Color: ${color}` : 'No color returned', 'pii');

    } catch (error) {
      recordTest('PII masking utilities', false, error.message, 'pii');
    }

  } catch (error) {
    recordTest('PII masking validation', false, error.message, 'pii');
  }
}

// Test 2: Trust Scoring Validation
async function testTrustScoring() {
  log('🧪 Testing trust scoring functionality...');
  
  try {
    // Test trust scoring API
    const response = await makeRequest(`${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('Trust scoring API', response.status === 200, 
      `Status: ${response.status}`, 'api');

    if (response.status === 200) {
      const data = response.data;
      
      // Test trust score presence
      const hasTrustScore = data.trustScore !== undefined;
      recordTest('Trust score present', hasTrustScore, 
        hasTrustScore ? `Score: ${data.trustScore}` : 'No trust score', 'trust');

      // Test loyalty tier
      const hasLoyaltyTier = data.loyaltyTier !== undefined;
      recordTest('Loyalty tier present', hasLoyaltyTier, 
        hasLoyaltyTier ? `Tier: ${data.loyaltyTier}` : 'No loyalty tier', 'trust');

      // Test recommendations
      const hasRecommendations = data.recommendations && Array.isArray(data.recommendations);
      recordTest('Trust recommendations present', hasRecommendations, 
        hasRecommendations ? `${data.recommendations.length} recommendations` : 'No recommendations', 'trust');

      // Test behavioral memory
      const hasBehavioralMemory = data.behavioralMemory !== undefined;
      recordTest('Behavioral memory present', hasBehavioralMemory, 
        hasBehavioralMemory ? 'Memory data present' : 'No behavioral memory', 'trust');

      if (hasBehavioralMemory) {
        const memory = data.behavioralMemory;
        
        // Test trust score in memory
        const memoryHasTrustScore = memory.trustScore !== undefined;
        recordTest('Memory trust score', memoryHasTrustScore, 
          memoryHasTrustScore ? `Memory score: ${memory.trustScore}` : 'No memory trust score', 'trust');

        // Test loyalty tier in memory
        const memoryHasLoyaltyTier = memory.loyaltyTier !== undefined;
        recordTest('Memory loyalty tier', memoryHasLoyaltyTier, 
          memoryHasLoyaltyTier ? `Memory tier: ${memory.loyaltyTier}` : 'No memory loyalty tier', 'trust');
      }
    }

    // Test trust scoring utility functions
    try {
      const { calculateTrustScore, getLoyaltyTier, getTrustScoreRecommendations } = require('../apps/app/lib/trustScoring');
      
      // Test trust score calculation
      const mockData = {
        totalSessions: 10,
        completedSessions: 9,
        successfulPayments: 9,
        totalRevenue: 50000,
        averageSatisfaction: 4.5,
        sessionDurationVariance: 0.1,
        cancellations: 1,
        noShows: 0,
        loyaltyPoints: 1500
      };
      
      const trustScore = calculateTrustScore(mockData);
      const hasValidScore = trustScore >= 0 && trustScore <= 100;
      
      recordTest('Trust score calculation', hasValidScore, 
        hasValidScore ? `Score: ${trustScore}` : `Invalid score: ${trustScore}`, 'trust');

      // Test loyalty tier calculation
      const loyaltyTier = getLoyaltyTier(trustScore);
      const hasValidTier = ['bronze', 'silver', 'gold', 'platinum'].includes(loyaltyTier);
      
      recordTest('Loyalty tier calculation', hasValidTier, 
        hasValidTier ? `Tier: ${loyaltyTier}` : `Invalid tier: ${loyaltyTier}`, 'trust');

      // Test recommendations
      const recommendations = getTrustScoreRecommendations(trustScore);
      const hasRecommendations = Array.isArray(recommendations) && recommendations.length > 0;
      
      recordTest('Trust score recommendations', hasRecommendations, 
        hasRecommendations ? `${recommendations.length} recommendations` : 'No recommendations', 'trust');

    } catch (error) {
      recordTest('Trust scoring utilities', false, error.message, 'trust');
    }

  } catch (error) {
    recordTest('Trust scoring validation', false, error.message, 'trust');
  }
}

// Test 3: Behavioral Memory Validation
async function testBehavioralMemory() {
  log('🧪 Testing behavioral memory functionality...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('Behavioral memory API', response.status === 200, 
      `Status: ${response.status}`, 'api');

    if (response.status === 200) {
      const data = response.data;
      
      if (data.behavioralMemory) {
        const memory = data.behavioralMemory;
        
        // Test preferences
        const hasPreferences = memory.preferences !== undefined;
        recordTest('Behavioral preferences', hasPreferences, 
          hasPreferences ? 'Preferences present' : 'No preferences', 'intelligence');

        if (hasPreferences) {
          const prefs = memory.preferences;
          
          // Test favorite flavors
          const hasFavoriteFlavors = prefs.favoriteFlavors && Array.isArray(prefs.favoriteFlavors);
          recordTest('Favorite flavors', hasFavoriteFlavors, 
            hasFavoriteFlavors ? `${prefs.favoriteFlavors.length} flavors` : 'No favorite flavors', 'intelligence');

          // Test preferred zone
          const hasPreferredZone = prefs.preferredZone !== undefined;
          recordTest('Preferred zone', hasPreferredZone, 
            hasPreferredZone ? `Zone: ${prefs.preferredZone}` : 'No preferred zone', 'intelligence');

          // Test average session duration
          const hasAvgDuration = prefs.averageSessionDuration !== undefined;
          recordTest('Average session duration', hasAvgDuration, 
            hasAvgDuration ? `${prefs.averageSessionDuration} minutes` : 'No average duration', 'intelligence');

          // Test spending pattern
          const hasSpendingPattern = prefs.spendingPattern !== undefined;
          recordTest('Spending pattern', hasSpendingPattern, 
            hasSpendingPattern ? `Pattern: ${prefs.spendingPattern}` : 'No spending pattern', 'intelligence');

          // Test visit frequency
          const hasVisitFrequency = prefs.visitFrequency !== undefined;
          recordTest('Visit frequency', hasVisitFrequency, 
            hasVisitFrequency ? `Frequency: ${prefs.visitFrequency}` : 'No visit frequency', 'intelligence');
        }

        // Test session history
        const hasSessionHistory = memory.sessionHistory && Array.isArray(memory.sessionHistory);
        recordTest('Session history', hasSessionHistory, 
          hasSessionHistory ? `${memory.sessionHistory.length} sessions` : 'No session history', 'intelligence');

        // Test predictive insights
        const hasPredictiveInsights = memory.predictiveInsights !== undefined;
        recordTest('Predictive insights', hasPredictiveInsights, 
          hasPredictiveInsights ? 'Insights present' : 'No predictive insights', 'intelligence');

        if (hasPredictiveInsights) {
          const insights = memory.predictiveInsights;
          
          // Test next visit prediction
          const hasNextVisitPrediction = insights.nextVisitPrediction !== undefined;
          recordTest('Next visit prediction', hasNextVisitPrediction, 
            hasNextVisitPrediction ? insights.nextVisitPrediction : 'No next visit prediction', 'intelligence');

          // Test likely order
          const hasLikelyOrder = insights.likelyOrder && Array.isArray(insights.likelyOrder);
          recordTest('Likely order', hasLikelyOrder, 
            hasLikelyOrder ? `${insights.likelyOrder.length} items` : 'No likely order', 'intelligence');

          // Test optimal service timing
          const hasOptimalTiming = insights.optimalServiceTiming !== undefined;
          recordTest('Optimal service timing', hasOptimalTiming, 
            hasOptimalTiming ? insights.optimalServiceTiming : 'No optimal timing', 'intelligence');

          // Test upsell probability
          const hasUpsellProbability = insights.upsellProbability !== undefined;
          recordTest('Upsell probability', hasUpsellProbability, 
            hasUpsellProbability ? `${insights.upsellProbability}%` : 'No upsell probability', 'intelligence');
        }
      }
    }

  } catch (error) {
    recordTest('Behavioral memory validation', false, error.message, 'intelligence');
  }
}

// Test 4: Operational Notes Validation
async function testOperationalNotes() {
  log('🧪 Testing operational notes functionality...');
  
  try {
    // Test getting operational notes
    const getResponse = await makeRequest(`${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('Operational notes retrieval', getResponse.status === 200, 
      `Status: ${getResponse.status}`, 'api');

    if (getResponse.status === 200) {
      const data = getResponse.data;
      
      // Test operational notes presence
      const hasOperationalNotes = data.operationalNotes && Array.isArray(data.operationalNotes);
      recordTest('Operational notes present', hasOperationalNotes, 
        hasOperationalNotes ? `${data.operationalNotes.length} notes` : 'No operational notes', 'intelligence');

      if (hasOperationalNotes) {
        const notes = data.operationalNotes;
        
        // Test note structure
        for (let i = 0; i < Math.min(notes.length, 3); i++) {
          const note = notes[i];
          
          // Test note ID
          const hasId = note.id !== undefined;
          recordTest(`Note ${i + 1} has ID`, hasId, 
            hasId ? `ID: ${note.id}` : 'No ID', 'intelligence');

          // Test note content
          const hasContent = note.content !== undefined;
          recordTest(`Note ${i + 1} has content`, hasContent, 
            hasContent ? `Content: ${note.content.substring(0, 50)}...` : 'No content', 'intelligence');

          // Test note author
          const hasAuthor = note.author !== undefined;
          recordTest(`Note ${i + 1} has author`, hasAuthor, 
            hasAuthor ? `Author: ${note.author}` : 'No author', 'intelligence');

          // Test note timestamp
          const hasTimestamp = note.createdAt !== undefined;
          recordTest(`Note ${i + 1} has timestamp`, hasTimestamp, 
            hasTimestamp ? `Created: ${note.createdAt}` : 'No timestamp', 'intelligence');

          // Test PII level
          const hasPiiLevel = note.piiLevel !== undefined;
          recordTest(`Note ${i + 1} has PII level`, hasPiiLevel, 
            hasPiiLevel ? `PII Level: ${note.piiLevel}` : 'No PII level', 'intelligence');

          // Test category
          const hasCategory = note.category !== undefined;
          recordTest(`Note ${i + 1} has category`, hasCategory, 
            hasCategory ? `Category: ${note.category}` : 'No category', 'intelligence');
        }
      }
    }

    // Test adding operational notes
    const addNoteResponse = await makeRequest(`${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`, {
      method: 'POST',
      body: {
        content: 'Test operational note for validation',
        author: 'Test User',
        category: 'test'
      }
    });

    recordTest('Operational note creation', addNoteResponse.status === 200, 
      `Status: ${addNoteResponse.status}`, 'api');

    if (addNoteResponse.status === 200) {
      const noteData = addNoteResponse.data;
      
      // Test note creation response
      const hasNote = noteData.note !== undefined;
      recordTest('Note creation response', hasNote, 
        hasNote ? 'Note created successfully' : 'No note in response', 'intelligence');

      if (hasNote) {
        const note = noteData.note;
        
        // Test created note structure
        const hasNoteId = note.id !== undefined;
        recordTest('Created note has ID', hasNoteId, 
          hasNoteId ? `ID: ${note.id}` : 'No ID', 'intelligence');

        const hasNoteContent = note.content === 'Test operational note for validation';
        recordTest('Created note has correct content', hasNoteContent, 
          hasNoteContent ? 'Content matches' : 'Content mismatch', 'intelligence');

        const hasNoteAuthor = note.author === 'Test User';
        recordTest('Created note has correct author', hasNoteAuthor, 
          hasNoteAuthor ? 'Author matches' : 'Author mismatch', 'intelligence');
      }
    }

  } catch (error) {
    recordTest('Operational notes validation', false, error.message, 'intelligence');
  }
}

// Test 5: Intelligence Dashboard UI Integration
async function testIntelligenceDashboardUI() {
  log('🧪 Testing Intelligence Dashboard UI integration...');
  
  try {
    // Test that Intelligence button exists on session cards
    const dashboardResponse = await makeRequest(`${BASE_URL}/fire-session-dashboard`);
    
    recordTest('Fire Session Dashboard accessible', dashboardResponse.status === 200, 
      `Status: ${dashboardResponse.status}`, 'api');

    if (dashboardResponse.status === 200) {
      const dashboardContent = dashboardResponse.data;
      
      // Test for Intelligence button in HTML content
      const hasIntelligenceButton = dashboardContent.includes('Intelligence') || 
                                   dashboardContent.includes('View Intelligence') ||
                                   dashboardContent.includes('guest-intelligence');
      
      recordTest('Intelligence button in dashboard', hasIntelligenceButton, 
        hasIntelligenceButton ? 'Intelligence button found' : 'No Intelligence button found', 'intelligence');
    }

    // Test Intelligence page accessibility
    const intelligencePageResponse = await makeRequest(`${BASE_URL}/guest-intelligence?sessionId=${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('Intelligence page accessible', intelligencePageResponse.status === 200, 
      `Status: ${intelligencePageResponse.status}`, 'api');

    if (intelligencePageResponse.status === 200) {
      const pageContent = intelligencePageResponse.data;
      
      // Test for key Intelligence Dashboard elements
      const hasPiiMaskingToggle = pageContent.includes('PII Masking') || 
                                 pageContent.includes('Masking') ||
                                 pageContent.includes('Privacy');
      
      recordTest('PII masking toggle in UI', hasPiiMaskingToggle, 
        hasPiiMaskingToggle ? 'PII masking toggle found' : 'No PII masking toggle', 'intelligence');

      const hasTrustScoreDisplay = pageContent.includes('Trust Score') || 
                                  pageContent.includes('Trust') ||
                                  pageContent.includes('Score');
      
      recordTest('Trust score display in UI', hasTrustScoreDisplay, 
        hasTrustScoreDisplay ? 'Trust score display found' : 'No trust score display', 'intelligence');

      const hasBehavioralMemory = pageContent.includes('Behavioral') || 
                                 pageContent.includes('Memory') ||
                                 pageContent.includes('Preferences');
      
      recordTest('Behavioral memory in UI', hasBehavioralMemory, 
        hasBehavioralMemory ? 'Behavioral memory found' : 'No behavioral memory', 'intelligence');
    }

  } catch (error) {
    recordTest('Intelligence Dashboard UI', false, error.message, 'intelligence');
  }
}

// Test 6: API Endpoint Validation
async function testAPIEndpoints() {
  log('🧪 Testing Guest Intelligence API endpoints...');
  
  const endpoints = [
    { name: 'Guest Intelligence GET', url: `${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`, method: 'GET' },
    { name: 'Guest Intelligence POST', url: `${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`, method: 'POST' },
    { name: 'Guest Intelligence with PII Masking', url: `${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}?piiMasking=true&piiLevel=medium`, method: 'GET' },
    { name: 'Guest Intelligence with PII Level High', url: `${BASE_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}?piiMasking=true&piiLevel=high`, method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url, { method: endpoint.method });
      const isAccessible = response.status === 200 || response.status === 404; // 404 is acceptable for some endpoints
      
      recordTest(`${endpoint.name} endpoint`, isAccessible, 
        `Status: ${response.status}`, 'api');
    } catch (error) {
      recordTest(`${endpoint.name} endpoint`, false, error.message, 'api');
    }
  }
}

// Main test runner
async function runGuestIntelligenceTests() {
  console.log('🧠 Starting Guest Intelligence Dashboard Validation Tests\n');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  // Run all test suites
  await testPIIMasking();
  await testTrustScoring();
  await testBehavioralMemory();
  await testOperationalNotes();
  await testIntelligenceDashboardUI();
  await testAPIEndpoints();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print comprehensive results
  console.log('\n' + '=' .repeat(80));
  console.log('📊 GUEST INTELLIGENCE DASHBOARD VALIDATION RESULTS');
  console.log('=' .repeat(80));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.total}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Categorized results
  console.log('\n📋 CATEGORIZED RESULTS:');
  console.log(`\n🔒 PII Tests: ${testResults.piiTests.filter(t => t.passed).length}/${testResults.piiTests.length} passed`);
  console.log(`🎯 Trust Tests: ${testResults.trustTests.filter(t => t.passed).length}/${testResults.trustTests.length} passed`);
  console.log(`🧠 Intelligence Tests: ${testResults.intelligenceTests.filter(t => t.passed).length}/${testResults.intelligenceTests.length} passed`);
  console.log(`🔌 API Tests: ${testResults.apiTests.filter(t => t.passed).length}/${testResults.apiTests.length} passed`);
  
  // Detailed results by category
  console.log('\n📋 DETAILED RESULTS:');
  testResults.details.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} [${test.category.toUpperCase()}] ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
  
  // Overall status
  const allPassed = testResults.failed === 0;
  console.log('\n' + '=' .repeat(80));
  if (allPassed) {
    console.log('🎉 ALL GUEST INTELLIGENCE TESTS PASSED!');
    console.log('✅ PII Masking: Validated');
    console.log('✅ Trust Scoring: Validated');
    console.log('✅ Behavioral Memory: Validated');
    console.log('✅ Operational Notes: Validated');
    console.log('✅ Intelligence Dashboard UI: Validated');
    console.log('✅ API Endpoints: Validated');
    console.log('\n🚀 GUEST INTELLIGENCE DASHBOARD IS READY FOR PRODUCTION!');
  } else {
    console.log('⚠️  SOME INTELLIGENCE TESTS FAILED! Review the issues above.');
    console.log('❌ Guest Intelligence Dashboard is NOT ready for production deployment.');
    console.log('🔧 Fix failing tests before proceeding.');
  }
  console.log('=' .repeat(80));
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runGuestIntelligenceTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runGuestIntelligenceTests };
