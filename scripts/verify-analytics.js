#!/usr/bin/env node

/**
 * Analytics Verification Script
 * Tests GA4 tracking, conversion events, and real-time monitoring
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  apps: [
    { name: 'Guest', url: 'http://localhost:3001', port: 3001 },
    { name: 'App', url: 'http://localhost:3002', port: 3002 },
    { name: 'Site', url: 'http://localhost:3003', port: 3003 }
  ],
  testEvents: [
    { name: 'page_view', category: 'engagement' },
    { name: 'conversion', category: 'conversion' },
    { name: 'engagement', category: 'user_interaction' },
    { name: 'ai_agent_interaction', category: 'ai_system' },
    { name: 'flow_constant_update', category: 'ai_system' }
  ]
};

class AnalyticsVerifier {
  constructor() {
    this.results = {
      ga4Setup: { status: 'pending', details: [] },
      conversionEvents: { status: 'pending', details: [] },
      realtimeMonitoring: { status: 'pending', details: [] },
      errorTracking: { status: 'pending', details: [] }
    };
  }

  async verifyGA4Setup() {
    console.log('🔍 Verifying GA4 Setup...');
    
    for (const app of CONFIG.apps) {
      try {
        const response = await this.makeRequest(app.url);
        const hasGA4Script = response.includes('googletagmanager.com/gtag/js');
        const hasGtagConfig = response.includes('gtag(\'config\'');
        const hasDataLayer = response.includes('dataLayer');
        
        this.results.ga4Setup.details.push({
          app: app.name,
          url: app.url,
          hasGA4Script,
          hasGtagConfig,
          hasDataLayer,
          status: hasGA4Script && hasGtagConfig && hasDataLayer ? 'pass' : 'fail'
        });
        
        console.log(`  ${app.name}: ${hasGA4Script && hasGtagConfig ? '✅' : '❌'} GA4 configured`);
      } catch (error) {
        this.results.ga4Setup.details.push({
          app: app.name,
          url: app.url,
          error: error.message,
          status: 'error'
        });
        console.log(`  ${app.name}: ❌ Error - ${error.message}`);
      }
    }
    
    const allPassed = this.results.ga4Setup.details.every(d => d.status === 'pass');
    this.results.ga4Setup.status = allPassed ? 'pass' : 'fail';
  }

  async testConversionEvents() {
    console.log('💰 Testing Conversion Events...');
    
    for (const app of CONFIG.apps) {
      try {
        const response = await this.makeRequest(app.url);
        
        // Check for conversion tracking functions
        const hasConversionTracking = response.includes('trackConversion') || 
                                   response.includes('gtag(\'event\', \'conversion\'');
        
        // Check for engagement tracking
        const hasEngagementTracking = response.includes('trackEngagement') || 
                                    response.includes('gtag(\'event\', \'engagement\'');
        
        this.results.conversionEvents.details.push({
          app: app.name,
          url: app.url,
          hasConversionTracking,
          hasEngagementTracking,
          status: hasConversionTracking && hasEngagementTracking ? 'pass' : 'fail'
        });
        
        console.log(`  ${app.name}: ${hasConversionTracking && hasEngagementTracking ? '✅' : '❌'} Conversion events configured`);
      } catch (error) {
        this.results.conversionEvents.details.push({
          app: app.name,
          url: app.url,
          error: error.message,
          status: 'error'
        });
        console.log(`  ${app.name}: ❌ Error - ${error.message}`);
      }
    }
    
    const allPassed = this.results.conversionEvents.details.every(d => d.status === 'pass');
    this.results.conversionEvents.status = allPassed ? 'pass' : 'fail';
  }

  async setupRealtimeMonitoring() {
    console.log('📊 Setting up Real-Time Monitoring...');
    
    try {
      // Test analytics dashboard
      const siteResponse = await this.makeRequest(CONFIG.apps[2].url + '/analytics');
      const hasAnalyticsDashboard = siteResponse.includes('Real-Time Analytics Dashboard');
      
      this.results.realtimeMonitoring.details.push({
        component: 'Analytics Dashboard',
        url: CONFIG.apps[2].url + '/analytics',
        hasDashboard: hasAnalyticsDashboard,
        status: hasAnalyticsDashboard ? 'pass' : 'fail'
      });
      
      console.log(`  Analytics Dashboard: ${hasAnalyticsDashboard ? '✅' : '❌'} Available`);
      
      // Test real-time events
      const hasRealtimeEvents = siteResponse.includes('Live Events Feed') && 
                              siteResponse.includes('realtimeEvents');
      
      this.results.realtimeMonitoring.details.push({
        component: 'Real-Time Events',
        hasRealtimeEvents,
        status: hasRealtimeEvents ? 'pass' : 'fail'
      });
      
      console.log(`  Real-Time Events: ${hasRealtimeEvents ? '✅' : '❌'} Configured`);
      
    } catch (error) {
      this.results.realtimeMonitoring.details.push({
        component: 'Analytics Dashboard',
        error: error.message,
        status: 'error'
      });
      console.log(`  Analytics Dashboard: ❌ Error - ${error.message}`);
    }
    
    const allPassed = this.results.realtimeMonitoring.details.every(d => d.status === 'pass');
    this.results.realtimeMonitoring.status = allPassed ? 'pass' : 'fail';
  }

  async configureErrorTracking() {
    console.log('🛡️ Configuring Error Tracking...');
    
    for (const app of CONFIG.apps) {
      try {
        const response = await this.makeRequest(app.url);
        
        // Check for error tracking
        const hasErrorTracking = response.includes('gtag(\'event\', \'exception\'') ||
                                response.includes('trackError') ||
                                response.includes('handleError');
        
        // Check for global error handlers
        const hasGlobalErrorHandlers = response.includes('addEventListener(\'error\'') ||
                                     response.includes('addEventListener(\'unhandledrejection\'');
        
        this.results.errorTracking.details.push({
          app: app.name,
          url: app.url,
          hasErrorTracking,
          hasGlobalErrorHandlers,
          status: hasErrorTracking && hasGlobalErrorHandlers ? 'pass' : 'fail'
        });
        
        console.log(`  ${app.name}: ${hasErrorTracking && hasGlobalErrorHandlers ? '✅' : '❌'} Error tracking configured`);
      } catch (error) {
        this.results.errorTracking.details.push({
          app: app.name,
          url: app.url,
          error: error.message,
          status: 'error'
        });
        console.log(`  ${app.name}: ❌ Error - ${error.message}`);
      }
    }
    
    const allPassed = this.results.errorTracking.details.every(d => d.status === 'pass');
    this.results.errorTracking.status = allPassed ? 'pass' : 'fail';
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  generateReport() {
    console.log('\n📋 Analytics Verification Report');
    console.log('=====================================');
    
    const sections = [
      { name: 'GA4 Setup', result: this.results.ga4Setup },
      { name: 'Conversion Events', result: this.results.conversionEvents },
      { name: 'Real-Time Monitoring', result: this.results.realtimeMonitoring },
      { name: 'Error Tracking', result: this.results.errorTracking }
    ];
    
    sections.forEach(section => {
      const status = section.result.status === 'pass' ? '✅' : '❌';
      console.log(`\n${status} ${section.name}: ${section.result.status.toUpperCase()}`);
      
      section.result.details.forEach(detail => {
        const detailStatus = detail.status === 'pass' ? '✅' : '❌';
        console.log(`  ${detailStatus} ${detail.app || detail.component}: ${detail.status}`);
        if (detail.error) {
          console.log(`    Error: ${detail.error}`);
        }
      });
    });
    
    const overallStatus = Object.values(this.results).every(r => r.status === 'pass') ? 'PASS' : 'FAIL';
    console.log(`\n🎯 Overall Status: ${overallStatus}`);
    
    if (overallStatus === 'FAIL') {
      console.log('\n🔧 Next Steps:');
      console.log('1. Set NEXT_PUBLIC_GA_ID environment variable');
      console.log('2. Verify GA4 script is loaded in all app layouts');
      console.log('3. Test conversion events in browser dev tools');
      console.log('4. Check real-time events in GA4 dashboard');
    } else {
      console.log('\n🎉 All analytics systems are properly configured!');
    }
  }

  async run() {
    console.log('🚀 Starting Analytics Verification...\n');
    
    await this.verifyGA4Setup();
    await this.testConversionEvents();
    await this.setupRealtimeMonitoring();
    await this.configureErrorTracking();
    
    this.generateReport();
  }
}

// Run verification
if (require.main === module) {
  const verifier = new AnalyticsVerifier();
  verifier.run().catch(console.error);
}

module.exports = AnalyticsVerifier;
