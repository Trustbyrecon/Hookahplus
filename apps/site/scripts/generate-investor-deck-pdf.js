/**
 * Generate Hookah+ Investor Deck PDF
 * 
 * This script generates a PDF from the investor page content using puppeteer
 * Run: node scripts/generate-investor-deck-pdf.js
 * 
 * Note: Requires puppeteer to be installed. If you encounter issues:
 * 1. Install puppeteer: npm install --save-dev puppeteer
 * 2. If Chromium download fails, set: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
 *    Then install Chromium separately or use system Chrome
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is available, if not, provide instructions
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.error('❌ Puppeteer not found.');
  console.log('\n📦 To install puppeteer, run:');
  console.log('   npm install --save-dev puppeteer');
  console.log('\n⚠️  If Chromium download fails, you can skip it:');
  console.log('   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install --save-dev puppeteer');
  process.exit(1);
}

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hookah+ Investor Deck</title>
  <style>
    @page {
      size: letter;
      margin: 0.75in;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
    }
    
    .page {
      page-break-after: always;
      padding: 0;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    h1 {
      font-size: 36px;
      font-weight: bold;
      color: #0a0a0a;
      margin-bottom: 12px;
      line-height: 1.2;
    }
    
    h2 {
      font-size: 28px;
      font-weight: bold;
      color: #14b8a6;
      margin-top: 32px;
      margin-bottom: 16px;
      border-bottom: 3px solid #14b8a6;
      padding-bottom: 8px;
    }
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #0a0a0a;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    p {
      margin-bottom: 12px;
      font-size: 15px;
      color: #333;
    }
    
    .intro {
      font-size: 20px;
      color: #555;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .subheadline {
      font-size: 18px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    
    .problem-list, .capability-list, .workflow-list, .advantage-list {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    .problem-list li, .capability-list li {
      margin-bottom: 12px;
      font-size: 15px;
      color: #333;
    }
    
    .problem-list li::marker {
      color: #ef4444;
    }
    
    .capability-list li::marker {
      color: #14b8a6;
    }
    
    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .workflow-item {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #14b8a6;
      border-radius: 4px;
      background: #f9fafb;
    }
    
    .workflow-item h4 {
      font-size: 16px;
      font-weight: 600;
      color: #14b8a6;
      margin-bottom: 8px;
    }
    
    .workflow-item p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
    
    .advantage-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .advantage-item {
      padding: 20px;
      border: 2px solid #14b8a6;
      border-radius: 8px;
      background: #f0fdfa;
    }
    
    .advantage-number {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: #14b8a6;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 40px;
      font-weight: bold;
      font-size: 20px;
      margin-right: 12px;
    }
    
    .advantage-item h4 {
      display: inline-block;
      font-size: 18px;
      font-weight: 600;
      color: #0a0a0a;
      margin: 0 0 8px 0;
    }
    
    .advantage-item p {
      font-size: 14px;
      color: #555;
      margin: 0;
    }
    
    .metric-box {
      background-color: #f5f5f5;
      border-left: 4px solid #14b8a6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .use-of-funds {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .fund-item {
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      text-align: center;
    }
    
    .fund-percentage {
      font-size: 32px;
      font-weight: bold;
      color: #14b8a6;
      margin-bottom: 8px;
    }
    
    .fund-label {
      font-size: 14px;
      color: #666;
    }
    
    .roadmap-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .roadmap-lane {
      padding: 20px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    
    .roadmap-lane h4 {
      font-size: 18px;
      font-weight: 600;
      color: #14b8a6;
      margin-bottom: 12px;
    }
    
    .roadmap-lane ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .roadmap-lane li {
      font-size: 14px;
      color: #555;
      margin-bottom: 8px;
    }
    
    .highlight-box {
      background-color: #f0fdfa;
      border: 2px solid #14b8a6;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .highlight-box p {
      margin: 0;
      font-size: 16px;
      color: #0a0a0a;
    }
    
    .testimonial {
      background: #f9fafb;
      border-left: 4px solid #14b8a6;
      padding: 16px;
      margin: 12px 0;
      border-radius: 4px;
      font-style: italic;
      color: #555;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #14b8a6, #06b6d4);
      color: white;
      padding: 32px;
      border-radius: 8px;
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-section h3 {
      color: white;
      margin-top: 0;
      font-size: 24px;
    }
    
    .cta-section p {
      color: white;
      font-size: 16px;
      margin-bottom: 16px;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    
    ul {
      margin: 12px 0;
    }
    
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page">
    <h1>Hookah+</h1>
    <p class="intro">The Session-First Operating Layer for Hookah Lounges</p>
    <p class="subheadline">Turning chaotic nights into trackable, repeatable revenue. We sit on top of a lounge's POS to track session time, flavor mixes, and table performance — unlocking clarity for owners and consistency for staff.</p>
    
    <div style="margin-top: 48px; padding: 24px; background: #f9fafb; border-radius: 8px;">
      <p style="margin: 0; font-size: 16px;"><strong>Founder:</strong> Dwayne Clark</p>
      <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Stage:</strong> MVP live, pilot lounges in motion</p>
    </div>
    
    <div class="footer">
      <p>Hookah+ Investor Deck | hookahplus.net</p>
    </div>
  </div>

  <!-- The Problem -->
  <div class="page">
    <h2>The Problem</h2>
    <p style="font-size: 18px; font-weight: 500; margin-bottom: 16px;">
      Hookah lounges run on sessions, not transactions — but every system they use is built for transactions.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Operators deal with daily pain points:
    </p>
    <ul class="problem-list">
      <li>Session time is mostly untracked — timers are manual, inconsistent, often forgotten.</li>
      <li>Flavor mixes live in staff memory, not in systems.</li>
      <li>No clean view of table or zone performance.</li>
      <li>POS systems only see "a bill," not the session that produced it.</li>
      <li>Owners fly blind on the biggest drivers of loyalty and margin.</li>
    </ul>
    <div class="highlight-box" style="margin-top: 32px;">
      <p><strong>Result:</strong> High-volume lounges operate in chaos, leaving money on the table every night.</p>
    </div>
  </div>

  <!-- Our Solution -->
  <div class="page">
    <h2>Our Solution: The Session-First Layer</h2>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.6;">
      Hookah+ is software that sits on top of the lounge's existing POS and workflow. We transform every hookah session — from QR scan to checkout — into structured data.
    </p>
    <div style="margin-bottom: 24px;">
      <h3>Core capabilities:</h3>
      <ul class="capability-list">
        <li>Complete session time tracking</li>
        <li>Flavor mix memory customized per guest</li>
        <li>Table & zone performance analytics</li>
        <li>Standardized staff flow from prep → deliver → checkout</li>
        <li>POS sync (Square, Clover, Toast) with no hardware changes</li>
      </ul>
    </div>
    <div class="highlight-box">
      <p><strong>No rip-and-replace required.</strong> Hookah+ works with what lounges already have.</p>
    </div>
  </div>

  <!-- How Hookah+ Works -->
  <div class="page">
    <h2>How Hookah+ Works (Night After Night)</h2>
    <p style="font-size: 16px; margin-bottom: 24px; text-align: center;">
      A clean operating flow for staff & owners:
    </p>
    <div class="workflow-grid">
      <div class="workflow-item">
        <h4>QR Scan</h4>
        <p>Guest scans table QR → new session starts.</p>
      </div>
      <div class="workflow-item">
        <h4>Order Build</h4>
        <p>Staff select bowl type, flavor mixes, add-ons, and notes.</p>
      </div>
      <div class="workflow-item">
        <h4>Prep Queue</h4>
        <p>Orders move through PENDING → READY → SERVED with timestamps.</p>
      </div>
      <div class="workflow-item">
        <h4>Session Timer</h4>
        <p>Timer activates on delivery; extensions and requests tracked in real time.</p>
      </div>
      <div class="workflow-item">
        <h4>Checkout Sync</h4>
        <p>Final bill and session metadata sync with the existing POS.</p>
      </div>
      <div class="workflow-item">
        <h4>Session Memory</h4>
        <p>Time, mix, notes, and staff actions stored for analytics and loyalty.</p>
      </div>
    </div>
    <p style="text-align: center; font-size: 18px; font-weight: 600; color: #14b8a6; margin-top: 24px;">
      Every session becomes actionable intelligence.
    </p>
  </div>

  <!-- Customer Focus -->
  <div class="page">
    <h2>Customer Focus</h2>
    <p style="font-size: 18px; margin-bottom: 20px;">
      We serve high-volume hookah lounges first.
    </p>
    <div style="margin-bottom: 24px;">
      <h3>Our ideal partners:</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li style="margin-bottom: 12px;">✓ Urban lounges with 10–40 tables</li>
        <li style="margin-bottom: 12px;">✓ Using Square / Clover / Toast</li>
        <li style="margin-bottom: 12px;">✓ Heavy weekend traffic and flavor-heavy menus</li>
        <li style="margin-bottom: 12px;">✓ Struggling with time tracking, table ops, or staff coordination</li>
      </ul>
    </div>
    <div class="highlight-box">
      <p>This segment feels the pain most acutely — and sees impact immediately.</p>
      <p style="font-size: 14px; margin-top: 8px; font-style: italic;">Secondary paths: multi-location groups, franchisors, and POS partners.</p>
    </div>
  </div>

  <!-- Market Opportunity -->
  <div class="page">
    <h2>Market Opportunity</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hookah lounges represent a strong, underserved vertical within hospitality:
    </p>
    <ul style="font-size: 15px; line-height: 1.8;">
      <li>Thousands of lounges across the U.S., Europe, and MENA</li>
      <li>Most using general-purpose POS tools that don't match session-based operations</li>
      <li>High session frequency and long dwell times create prime conditions for optimization</li>
    </ul>
    <div class="highlight-box" style="margin-top: 32px;">
      <p style="font-size: 18px; font-weight: 600;">
        We're building the default operating layer for a niche that has never had purpose-built software.
      </p>
    </div>
  </div>

  <!-- Traction & Early Signals -->
  <div class="page">
    <h2>Traction & Early Signals</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hookah+ is live and evolving with real operators.
    </p>
    <div style="margin-bottom: 24px;">
      <h3>Early traction indicators:</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li style="margin-bottom: 12px;">✓ Pilot lounges actively onboarding</li>
        <li style="margin-bottom: 12px;">✓ Sessions tracked and staff flow validated</li>
        <li style="margin-bottom: 12px;">✓ Strong operator feedback</li>
      </ul>
    </div>
    <div style="margin-top: 24px;">
      <div class="testimonial">
        "We finally stopped arguing about timers."
      </div>
      <div class="testimonial">
        "Staff love seeing the queue — no more guessing."
      </div>
      <div class="testimonial">
        "Checkout disputes dropped immediately."
      </div>
    </div>
    <div class="highlight-box" style="margin-top: 24px;">
      <p>Our product improves every week through direct feedback loops with real lounges.</p>
    </div>
  </div>

  <!-- Business Model -->
  <div class="page">
    <h2>Business Model</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We monetize through a hybrid SaaS model:
    </p>
    <ul style="font-size: 15px; line-height: 1.8;">
      <li><strong>Monthly subscription per lounge</strong> (Starter, Pro, Network tiers)</li>
      <li><strong>Session-based add-ons</strong> for advanced features</li>
      <li><strong>Multi-location and franchisor pricing</strong></li>
      <li><strong>Future integrations</strong> for POS partners and hospitality networks</li>
    </ul>
    <div class="highlight-box" style="margin-top: 32px;">
      <p style="font-size: 18px; font-weight: 600;">
        Revenue scales with sessions — not just locations.
      </p>
    </div>
  </div>

  <!-- Competitive Advantages -->
  <div class="page">
    <h2>Competitive Advantages</h2>
    <div class="advantage-grid">
      <div class="advantage-item">
        <span class="advantage-number">1</span>
        <h4>Session-First Architecture</h4>
        <p>Time, flavor, table, staff — the primitives of hookah operations.</p>
      </div>
      <div class="advantage-item">
        <span class="advantage-number">2</span>
        <h4>Deep Vertical Focus</h4>
        <p>Built specifically for hookah lounges, not repurposed restaurant tools.</p>
      </div>
      <div class="advantage-item">
        <span class="advantage-number">3</span>
        <h4>POS-Adjacent, Not POS-Competing</h4>
        <p>We complement Square, Clover, and Toast instead of replacing them.</p>
      </div>
      <div class="advantage-item">
        <span class="advantage-number">4</span>
        <h4>Session Memory as a Moat</h4>
        <p>The longer Hookah+ runs in a lounge, the more valuable and irreplaceable it becomes.</p>
      </div>
    </div>
    <p style="text-align: center; font-size: 18px; font-weight: 600; color: #14b8a6; margin-top: 24px;">
      The longer Hookah+ runs in a lounge, the smarter and stickier it becomes.
    </p>
  </div>

  <!-- Roadmap -->
  <div class="page">
    <h2>Roadmap</h2>
    <div class="roadmap-grid">
      <div class="roadmap-lane">
        <h4>Product Evolution</h4>
        <ul>
          <li>Full analytics suite (tables, zones, staff)</li>
          <li>Lounge layout + zone heatmaps</li>
          <li>Loyalty and personalized mix recommendations</li>
          <li>Automated session risk alerts</li>
        </ul>
      </div>
      <div class="roadmap-lane">
        <h4>GTM & Scale</h4>
        <ul>
          <li>Anchor 3–5 flagship lounges</li>
          <li>Expand across major metro areas</li>
          <li>Co-market with POS partners</li>
        </ul>
      </div>
      <div class="roadmap-lane">
        <h4>Platform Vision</h4>
        <ul>
          <li>Open API for chains and groups</li>
          <li>Standardized session data layer for the industry</li>
          <li>Predictive insights for staffing, inventory, and repeat behavior</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Team -->
  <div class="page">
    <h2>Team</h2>
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
      Hookah+ is founded by <strong>Dwayne Clark</strong>, with a focus on applying structured operational intelligence to an underserved, complex hospitality vertical.
    </p>
    <div class="highlight-box">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Our belief:</p>
      <p style="font-style: italic; font-size: 16px;">
        The unglamorous parts of a hookah lounge — timing, prep flow, mix memory — are the ones that drive repeat visits and revenue. Mastering them creates an unfair advantage.
      </p>
    </div>
  </div>

  <!-- Current Raise -->
  <div class="page">
    <h2>Current Raise</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We are raising funding to:
    </p>
    <ul style="list-style: none; padding-left: 0; font-size: 15px; line-height: 1.8;">
      <li style="margin-bottom: 12px;">✓ Expand engineering and product velocity</li>
      <li style="margin-bottom: 12px;">✓ Deepen POS integrations</li>
      <li style="margin-bottom: 12px;">✓ Onboard the first 50–100 lounges</li>
      <li style="margin-bottom: 12px;">✓ Build scalable onboarding & support systems</li>
    </ul>
    <div style="margin-top: 32px;">
      <h3>Use of funds breakdown:</h3>
      <div class="use-of-funds">
        <div class="fund-item">
          <div class="fund-percentage">50%</div>
          <div class="fund-label">Product & engineering</div>
        </div>
        <div class="fund-item">
          <div class="fund-percentage">30%</div>
          <div class="fund-label">Lounge onboarding & GTM</div>
        </div>
        <div class="fund-item">
          <div class="fund-percentage">20%</div>
          <div class="fund-label">Infrastructure & operations</div>
        </div>
      </div>
    </div>
    <div class="cta-section" style="margin-top: 40px;">
      <h3>Let's define the operating layer of the hookah industry.</h3>
      <p>Hookah+ is building the first system of record for session-based lounges.</p>
      <p style="font-size: 14px; margin-top: 16px;">
        Book a founder call: calendly.com/clark-dwayne/new-meeting
      </p>
    </div>
  </div>

  <div class="footer">
    <p>© 2025 HookahPlus. All rights reserved. | hookahplus.net</p>
  </div>
</body>
</html>
`;

async function generatePDF() {
  console.log('🚀 Starting Investor Deck PDF generation...');
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    try {
      const page = await browser.newPage();
      
      // Set content
      await page.setContent(HTML_CONTENT, {
        waitUntil: 'networkidle0'
      });
      
      // Generate PDF
      const outputPath = path.join(__dirname, '../public/investor-deck.pdf');
      const outputDir = path.dirname(outputPath);
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      await page.pdf({
        path: outputPath,
        format: 'Letter',
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        },
        printBackground: true,
        preferCSSPageSize: true
      });
      
      console.log('✅ PDF generated successfully!');
      console.log(`📄 Location: ${outputPath}`);
      console.log(`\n📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('❌ Error launching browser:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure puppeteer is installed: npm install --save-dev puppeteer');
    console.log('2. If Chromium download fails, try:');
    console.log('   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install --save-dev puppeteer');
    console.log('3. On Windows, you may need to install Chrome/Chromium separately');
    console.log('4. Check that you have sufficient disk space for Chromium (~170MB)');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePDF().catch(console.error);
}

module.exports = { generatePDF };
