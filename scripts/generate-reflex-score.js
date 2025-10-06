#!/usr/bin/env node

/**
 * Hookah+ Reflex Score Generator
 * Generates reflex scores based on test coverage and code quality metrics
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REFLEX_THRESHOLDS = {
  excellent: 0.95,
  good: 0.85,
  acceptable: 0.75,
  poor: 0.60
};

const COVERAGE_WEIGHTS = {
  unit: 0.4,
  e2e: 0.3,
  integration: 0.2,
  performance: 0.1
};

/**
 * Calculate reflex score based on test coverage and quality metrics
 */
function calculateReflexScore(project, metrics) {
  const {
    unitCoverage = 0,
    e2eCoverage = 0,
    integrationCoverage = 0,
    performanceScore = 0,
    buildSuccess = false,
    lintPassed = false,
    securityScore = 0
  } = metrics;

  // Base score from test coverage
  const coverageScore = (
    unitCoverage * COVERAGE_WEIGHTS.unit +
    e2eCoverage * COVERAGE_WEIGHTS.e2e +
    integrationCoverage * COVERAGE_WEIGHTS.integration +
    performanceScore * COVERAGE_WEIGHTS.performance
  );

  // Quality multipliers
  const buildMultiplier = buildSuccess ? 1.0 : 0.5;
  const lintMultiplier = lintPassed ? 1.0 : 0.9;
  const securityMultiplier = Math.max(0.5, securityScore / 100);

  // Calculate final score
  const finalScore = coverageScore * buildMultiplier * lintMultiplier * securityMultiplier;

  // Determine risk level
  let risk = 'low';
  if (finalScore < REFLEX_THRESHOLDS.poor) {
    risk = 'high';
  } else if (finalScore < REFLEX_THRESHOLDS.acceptable) {
    risk = 'medium';
  }

  // Calculate coverage delta (improvement over baseline)
  const baselineScore = 0.0; // Starting from zero
  const coverageDelta = finalScore - baselineScore;

  // Estimate bundle size impact (placeholder)
  const bundleDeltaKB = 0; // Would be calculated from actual bundle analysis

  return {
    score: Math.round(finalScore * 100) / 100,
    coverageDelta: Math.round(coverageDelta * 100) / 100,
    bundleDeltaKB,
    risk,
    breakdown: {
      coverageScore: Math.round(coverageScore * 100) / 100,
      buildMultiplier,
      lintMultiplier,
      securityMultiplier,
      unitCoverage,
      e2eCoverage,
      integrationCoverage,
      performanceScore
    }
  };
}

/**
 * Read test coverage from coverage reports
 */
function readCoverageReport(projectPath) {
  const coveragePath = path.join(projectPath, 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    return { unitCoverage: 0, e2eCoverage: 0 };
  }

  try {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;
    
    return {
      unitCoverage: total.lines.pct / 100,
      e2eCoverage: 0.8, // Placeholder - would be calculated from E2E test results
      integrationCoverage: 0.7 // Placeholder - would be calculated from integration tests
    };
  } catch (error) {
    console.warn(`Could not read coverage report for ${projectPath}:`, error.message);
    return { unitCoverage: 0, e2eCoverage: 0 };
  }
}

/**
 * Read performance metrics from Lighthouse reports
 */
function readPerformanceMetrics(projectPath) {
  const lighthousePath = path.join(projectPath, 'lighthouse-report.json');
  
  if (!fs.existsSync(lighthousePath)) {
    return { performanceScore: 0 };
  }

  try {
    const lighthouse = JSON.parse(fs.readFileSync(lighthousePath, 'utf8'));
    const performance = lighthouse.categories.performance?.score || 0;
    
    return { performanceScore: performance };
  } catch (error) {
    console.warn(`Could not read Lighthouse report for ${projectPath}:`, error.message);
    return { performanceScore: 0 };
  }
}

/**
 * Generate reflex score for a project
 */
function generateProjectReflexScore(project) {
  const projectPath = path.join('apps', project);
  
  if (!fs.existsSync(projectPath)) {
    console.warn(`Project ${project} not found at ${projectPath}`);
    return null;
  }

  // Read metrics
  const coverage = readCoverageReport(projectPath);
  const performance = readPerformanceMetrics(projectPath);
  
  // Check build status (simplified)
  const buildSuccess = fs.existsSync(path.join(projectPath, '.next')) || 
                      fs.existsSync(path.join(projectPath, 'dist'));
  
  // Check lint status (simplified)
  const lintPassed = !fs.existsSync(path.join(projectPath, '.eslintrc.error'));
  
  // Security score (placeholder)
  const securityScore = 85; // Would be calculated from security audit

  const metrics = {
    ...coverage,
    ...performance,
    buildSuccess,
    lintPassed,
    securityScore
  };

  return calculateReflexScore(project, metrics);
}

/**
 * Main function
 */
function main() {
  const projects = ['app', 'guest', 'site'];
  const reflexScores = {};

  console.log('🧪 Generating Reflex Scores...\n');

  for (const project of projects) {
    console.log(`📊 Analyzing ${project}...`);
    
    const score = generateProjectReflexScore(project);
    if (score) {
      reflexScores[project] = score;
      
      console.log(`   Score: ${score.score}`);
      console.log(`   Risk: ${score.risk}`);
      console.log(`   Coverage Delta: ${score.coverageDelta}`);
      console.log(`   Bundle Delta: ${score.bundleDeltaKB}KB\n`);
    }
  }

  // Calculate overall score
  const overallScore = Object.values(reflexScores).reduce((sum, score) => sum + score.score, 0) / projects.length;
  const overallRisk = Object.values(reflexScores).some(score => score.risk === 'high') ? 'high' : 
                     Object.values(reflexScores).some(score => score.risk === 'medium') ? 'medium' : 'low';

  const reflexData = {
    timestamp: new Date().toISOString(),
    overall: {
      score: Math.round(overallScore * 100) / 100,
      risk: overallRisk,
      projects: Object.keys(reflexScores).length
    },
    projects: reflexScores
  };

  // Write reflex score file
  const outputPath = 'tmp/reflex-score.json';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(reflexData, null, 2));

  console.log(`✅ Reflex scores generated: ${outputPath}`);
  console.log(`📈 Overall Score: ${reflexData.overall.score}`);
  console.log(`⚠️  Overall Risk: ${reflexData.overall.risk}`);

  // Exit with appropriate code
  if (overallRisk === 'high') {
    process.exit(1);
  } else if (overallRisk === 'medium') {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { calculateReflexScore, generateProjectReflexScore };
