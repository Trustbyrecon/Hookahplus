#!/usr/bin/env node

/**
 * Hookah+ Production Deployment Script
 * Automates the deployment process with safety checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Hookah+ Production Deployment');
console.log('================================');
console.log('');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the app directory');
  process.exit(1);
}

// Check if we have uncommitted changes
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  Warning: You have uncommitted changes');
    console.log('   Please commit or stash them before deployment');
    console.log('');
    console.log(gitStatus);
    console.log('');
    console.log('❌ Deployment cancelled for safety');
    process.exit(1);
  }
} catch (error) {
  console.log('⚠️  Warning: Could not check git status');
}

// Check if we're on main branch
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (currentBranch !== 'main') {
    console.log(`⚠️  Warning: You're not on the main branch (currently on: ${currentBranch})`);
    console.log('   Please switch to main branch: git checkout main');
    process.exit(1);
  }
} catch (error) {
  console.log('⚠️  Warning: Could not check git branch');
}

// Check if production environment template exists
if (!fs.existsSync('env.production.template')) {
  console.error('❌ Error: env.production.template not found');
  console.log('   Please create the production environment template');
  process.exit(1);
}

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.log('⚠️  Warning: .env.production not found');
  console.log('   Creating from template...');
  try {
    fs.copyFileSync('env.production.template', '.env.production');
    console.log('✅ Created .env.production from template');
    console.log('   Please update with your production values before deploying');
  } catch (error) {
    console.error('❌ Error creating .env.production:', error.message);
    process.exit(1);
  }
}

// Check for test keys in production environment
const envContent = fs.readFileSync('.env.production', 'utf8');
if (envContent.includes('sk_test_') || envContent.includes('pk_test_')) {
  console.error('❌ ERROR: Test Stripe keys found in production environment!');
  console.log('   Please update .env.production with LIVE Stripe keys');
  console.log('   Replace sk_test_ with sk_live_ and pk_test_ with pk_live_');
  process.exit(1);
}

console.log('✅ Production environment verified');

// Run pre-deployment tests
console.log('');
console.log('🧪 Running pre-deployment tests...');

try {
  console.log('   Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.log('⚠️  Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI:', installError.message);
    console.log('   Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

// Deploy to Vercel
console.log('');
console.log('🚀 Deploying to Vercel...');

try {
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

// Post-deployment verification
console.log('');
console.log('🔍 Post-deployment verification...');

try {
  // Get deployment URL from Vercel
  const deploymentInfo = execSync('vercel ls --json', { encoding: 'utf8' });
  const deployments = JSON.parse(deploymentInfo);
  const latestDeployment = deployments[0];
  
  if (latestDeployment && latestDeployment.url) {
    console.log(`✅ Deployment URL: ${latestDeployment.url}`);
    
    // Test health endpoint
    console.log('   Testing health endpoint...');
    try {
      const healthResponse = execSync(`curl -s ${latestDeployment.url}/api/health`, { encoding: 'utf8' });
      if (healthResponse.includes('ok')) {
        console.log('✅ Health check passed');
      } else {
        console.log('⚠️  Health check returned unexpected response');
      }
    } catch (healthError) {
      console.log('⚠️  Health check failed (this might be normal if curl is not available)');
    }
  }
} catch (error) {
  console.log('⚠️  Could not verify deployment (this might be normal)');
}

console.log('');
console.log('🎉 Production deployment completed!');
console.log('');
console.log('Next steps:');
console.log('1. Update your domain DNS to point to the Vercel deployment');
console.log('2. Configure Stripe webhooks for production');
console.log('3. Set up monitoring and alerting');
console.log('4. Test all functionality in production');
console.log('');
console.log('For support, check the deployment logs in Vercel dashboard');
