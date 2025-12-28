/**
 * Newsletter Subscription Query Script
 * Queries the database directly to check newsletter signups
 * 
 * Usage: npx tsx scripts/query-newsletter-subscriptions.ts [days]
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const prisma = new PrismaClient();

async function queryNewsletterSubscriptions(days: number = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    console.log('📧 Newsletter Subscription Report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Time Period: Last ${days} days`);
    console.log(`Since: ${since.toISOString()}`);
    console.log('');

    // Query newsletter signups
    const events = await prisma.reflexEvent.findMany({
      where: {
        type: 'cta.newsletter_signup',
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    console.log(`Total Signups: ${events.length}`);
    console.log('');

    if (events.length === 0) {
      console.log('No newsletter signups found in this period.');
      return;
    }

    // Aggregate statistics
    const bySource: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const emails: string[] = [];

    events.forEach(event => {
      // Count by source
      if (event.ctaSource) {
        bySource[event.ctaSource] = (bySource[event.ctaSource] || 0) + 1;
      }

      // Count by day
      const day = event.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;

      // Extract emails
      if (event.payload) {
        try {
          const payload = JSON.parse(event.payload);
          if (payload.data?.email) {
            emails.push(payload.data.email);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    // Display statistics
    console.log('📊 By Source:');
    Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
      });
    console.log('');

    console.log('📅 By Day (last 7 days):');
    const sortedDays = Object.entries(byDay)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
    
    sortedDays.forEach(([day, count]) => {
      console.log(`  ${day}: ${count}`);
    });
    console.log('');

    // Show recent signups
    console.log('📧 Recent Signups (last 10):');
    events.slice(0, 10).forEach((event, idx) => {
      let email = 'no email';
      let name = '';
      let page = '';
      
      if (event.payload) {
        try {
          const payload = JSON.parse(event.payload);
          email = payload.data?.email || 'no email';
          name = payload.data?.name || '';
          page = payload.page || '';
        } catch (e) {
          // Ignore parse errors
        }
      }

      const date = event.createdAt.toISOString().split('T')[0];
      const time = event.createdAt.toISOString().split('T')[1].split('.')[0];
      
      console.log(`  ${idx + 1}. ${date} ${time}`);
      console.log(`     Email: ${email}`);
      if (name) console.log(`     Name: ${name}`);
      if (page) console.log(`     Page: ${page}`);
      if (event.referrer) console.log(`     Referrer: ${event.referrer}`);
      console.log('');
    });

    // Unique emails
    const uniqueEmails = [...new Set(emails)];
    console.log(`📬 Unique Emails: ${uniqueEmails.length}`);
    console.log('');

    // MOAT Analysis
    console.log('🛡️ MOAT Alignment:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Potential Network Nodes: ${uniqueEmails.length}`);
    console.log(`Identity Capture Rate: ${((uniqueEmails.length / events.length) * 100).toFixed(1)}%`);
    console.log(`Average Signups/Day: ${(events.length / days).toFixed(1)}`);
    console.log('');

    // Content engagement (if we can parse it)
    const contentSources: Record<string, number> = {};
    events.forEach(event => {
      if (event.referrer) {
        const url = new URL(event.referrer);
        const path = url.pathname;
        if (path.includes('/blog/')) {
          const post = path.split('/blog/')[1];
          contentSources[post] = (contentSources[post] || 0) + 1;
        } else if (path.includes('/works-with-square')) {
          contentSources['works-with-square'] = (contentSources['works-with-square'] || 0) + 1;
        }
      }
    });

    if (Object.keys(contentSources).length > 0) {
      console.log('📝 Content Engagement (which pages drove signups):');
      Object.entries(contentSources)
        .sort((a, b) => b[1] - a[1])
        .forEach(([content, count]) => {
          console.log(`  ${content}: ${count}`);
        });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error querying newsletter subscriptions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get days from command line argument
const days = process.argv[2] ? parseInt(process.argv[2]) : 30;
queryNewsletterSubscriptions(days);

