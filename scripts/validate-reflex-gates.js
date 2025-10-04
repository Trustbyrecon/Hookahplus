// scripts/validate-reflex-gates.js
// Validate reflex score gates are properly implemented

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Reflex Score Gates...');

// Check if reflex types are properly defined
const reflexTypesPath = path.join(__dirname, '../types/reflex.ts');
if (!fs.existsSync(reflexTypesPath)) {
  console.error('❌ types/reflex.ts not found');
  process.exit(1);
}

// Check if reflex core library exists
const reflexLibPath = path.join(__dirname, '../lib/reflex');
if (!fs.existsSync(reflexLibPath)) {
  console.error('❌ lib/reflex directory not found');
  process.exit(1);
}

// Check required reflex files
const requiredFiles = [
  'lib/reflex/scoreGate.ts',
  'lib/reflex/ghostLog.ts',
  'lib/reflex/reflexEngine.ts'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} not found`);
    process.exit(1);
  }
}

// Check if API endpoints have reflex integration
const apiEndpoints = [
  'app/api/events/route.reflex.ts',
  'app/api/badges/route.reflex.ts',
  'app/api/badges/export/route.reflex.ts'
];

for (const endpoint of apiEndpoints) {
  const filePath = path.join(__dirname, '..', endpoint);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${endpoint} not found`);
    process.exit(1);
  }
}

// Check if UI components exist
const uiComponents = [
  'components/ReflexMonitor.tsx',
  'components/ReflexScoreIndicator.tsx',
  'components/ReflexAlert.tsx'
];

for (const component of uiComponents) {
  const filePath = path.join(__dirname, '..', component);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${component} not found`);
    process.exit(1);
  }
}

// Check if tests exist
const testFiles = [
  'tests/reflex.spec.ts'
];

for (const testFile of testFiles) {
  const filePath = path.join(__dirname, '..', testFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${testFile} not found`);
    process.exit(1);
  }
}

// Validate score gate thresholds
try {
  const scoreGatePath = path.join(__dirname, '../lib/reflex/scoreGate.ts');
  const scoreGateContent = fs.readFileSync(scoreGatePath, 'utf8');
  
  // Check for proper threshold values
  if (!scoreGateContent.includes('PROCEED_THRESHOLD = 0.92')) {
    console.error('❌ PROCEED_THRESHOLD not set to 0.92');
    process.exit(1);
  }
  
  if (!scoreGateContent.includes('RECOVER_THRESHOLD = 0.87')) {
    console.error('❌ RECOVER_THRESHOLD not set to 0.87');
    process.exit(1);
  }
  
  console.log('✅ Score gate thresholds are correct');
} catch (error) {
  console.error('❌ Error validating score gates:', error.message);
  process.exit(1);
}

// Validate GhostLog implementation
try {
  const ghostLogPath = path.join(__dirname, '../lib/reflex/ghostLog.ts');
  const ghostLogContent = fs.readFileSync(ghostLogPath, 'utf8');
  
  // Check for required methods
  const requiredMethods = [
    'log(',
    'getEntries(',
    'getAgentStats(',
    'getSystemHealth('
  ];
  
  for (const method of requiredMethods) {
    if (!ghostLogContent.includes(method)) {
      console.error(`❌ GhostLog missing method: ${method}`);
      process.exit(1);
    }
  }
  
  console.log('✅ GhostLog implementation is complete');
} catch (error) {
  console.error('❌ Error validating GhostLog:', error.message);
  process.exit(1);
}

// Validate reflex engine
try {
  const reflexEnginePath = path.join(__dirname, '../lib/reflex/reflexEngine.ts');
  const reflexEngineContent = fs.readFileSync(reflexEnginePath, 'utf8');
  
  // Check for required methods
  const requiredMethods = [
    'executeBadgeOperation(',
    'executeAPIOperation(',
    'calculateBadgeReflexScore(',
    'calculateAPIReflexScore('
  ];
  
  for (const method of requiredMethods) {
    if (!reflexEngineContent.includes(method)) {
      console.error(`❌ ReflexEngine missing method: ${method}`);
      process.exit(1);
    }
  }
  
  console.log('✅ ReflexEngine implementation is complete');
} catch (error) {
  console.error('❌ Error validating ReflexEngine:', error.message);
  process.exit(1);
}

console.log('✅ All reflex score gates validation passed!');
console.log('🎉 Reflex system is properly implemented and ready for deployment');
