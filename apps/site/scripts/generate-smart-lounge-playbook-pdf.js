/**
 * Generate Smart Lounge Playbook 2026 PDF
 * 
 * This script generates a PDF from the brief content using puppeteer
 * Run: node scripts/generate-smart-lounge-playbook-pdf.js
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is available, if not, provide instructions
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.error('❌ Puppeteer not found. Installing...');
  console.log('Run: npm install --save-dev puppeteer');
  process.exit(1);
}

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Smart Lounge Playbook 2026</title>
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
    }
    
    .page {
      page-break-after: always;
      padding: 0;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    h1 {
      font-size: 32px;
      font-weight: bold;
      color: #0a0a0a;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    
    h2 {
      font-size: 24px;
      font-weight: bold;
      color: #14b8a6;
      margin-top: 32px;
      margin-bottom: 16px;
      border-bottom: 2px solid #14b8a6;
      padding-bottom: 8px;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0a0a0a;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    p {
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .intro {
      font-size: 18px;
      color: #333;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .metric-box {
      background-color: #f5f5f5;
      border-left: 4px solid #14b8a6;
      padding: 16px;
      margin: 16px 0;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #14b8a6;
      margin-bottom: 4px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #666;
    }
    
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
    }
    
    .comparison-box {
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .before {
      border-left: 4px solid #ef4444;
    }
    
    .after {
      border-left: 4px solid #14b8a6;
    }
    
    .before h3 {
      color: #ef4444;
    }
    
    .after h3 {
      color: #14b8a6;
    }
    
    ul {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .highlight-box {
      background-color: #f0fdfa;
      border: 1px solid #14b8a6;
      border-radius: 4px;
      padding: 16px;
      margin: 24px 0;
    }
    
    .cta-box {
      background: linear-gradient(135deg, #14b8a6, #06b6d4);
      color: white;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-box h3 {
      color: white;
      margin-top: 0;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover & Introduction -->
  <div class="page">
    <h1>The Smart Lounge Playbook 2026</h1>
    <p class="intro">How to Turn Every Hookah Session Into a Revenue Loop</p>
    
    <p>While exhibitors at World Shisha 2026 showcase flavors, charcoal, and hardware, Hookah+ is the operations + analytics brain that helps lounges make more money. This playbook shows you exactly how top-performing lounges use data-driven operations to increase revenue, reduce costs, and delight customers.</p>
    
    <div class="highlight-box">
      <p><strong>Positioning:</strong> While everyone else shows flavors and pipes, we're the data + operations brain for lounges.</p>
    </div>
    
    <div class="footer">
      <p>World Shisha Trade Show 2026 | February 4-5, Dubai | hookahplus.net</p>
    </div>
  </div>

  <!-- Page 2: Session Time vs. Revenue -->
  <div class="page">
    <h2>Session Time vs. Revenue</h2>
    
    <div class="comparison-grid">
      <div class="comparison-box before">
        <h3>Before Hookah+</h3>
        <ul>
          <li>Manual session tracking</li>
          <li>3.2 average table turns per day</li>
          <li>12-minute average order time</li>
          <li>Limited upsell opportunities</li>
        </ul>
      </div>
      
      <div class="comparison-box after">
        <h3>After Hookah+</h3>
        <ul>
          <li>Automated session tracking</li>
          <li>3.9 average table turns per day (+22%)</li>
          <li>7.8-minute average order time (-35%)</li>
          <li>30% session extension rate</li>
        </ul>
      </div>
    </div>

    <div class="metric-box">
      <h3>Revenue Impact</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px;">
        <div>
          <div class="metric-value">↑ 22%</div>
          <div class="metric-label">Table Turns</div>
        </div>
        <div>
          <div class="metric-value">↑ 30%</div>
          <div class="metric-label">Session Extensions</div>
        </div>
        <div>
          <div class="metric-value">↑ 18%</div>
          <div class="metric-label">Upsell Revenue</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page 3: Popular Mix Patterns -->
  <div class="page">
    <h2>Popular Mix Patterns</h2>
    
    <p>Data from 10,000+ sessions shows which flavor combinations drive the most revenue and customer satisfaction.</p>

    <div class="metric-box">
      <h3>Top Flavor Combinations</h3>
      <ul>
        <li><strong>Blue Mist + Mint:</strong> 32% - Highest revenue per session</li>
        <li><strong>Strawberry + Mango:</strong> 28% - Most popular combination</li>
        <li><strong>Double Apple + Rose:</strong> 24% - Premium tier favorite</li>
      </ul>
    </div>

    <div class="highlight-box">
      <p><strong>Insight:</strong> Premium flavor combinations (3+ flavors) generate 40% more revenue per session than single-flavor orders.</p>
    </div>
  </div>

  <!-- Page 4: Staff Efficiency & Table Turn Time -->
  <div class="page">
    <h2>Staff Efficiency & Table Turn Time</h2>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0;">
      <div class="metric-box">
        <div class="metric-value">↓ 35%</div>
        <div class="metric-label">Order Time Reduction</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">12 min → 7.8 min</div>
      </div>

      <div class="metric-box">
        <div class="metric-value">↑ 22%</div>
        <div class="metric-label">Table Turn Increase</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">3.2 → 3.9 per day</div>
      </div>

      <div class="metric-box">
        <div class="metric-value">15+</div>
        <div class="metric-label">Orders per Staff/Shift</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">Industry leading</div>
      </div>
    </div>

    <div class="highlight-box">
      <h3>How It Works</h3>
      <ul>
        <li>QR-based ordering eliminates wait staff bottlenecks</li>
        <li>Automated session tracking reduces manual coordination</li>
        <li>Real-time alerts optimize Back of the House and Front of the House workflow</li>
      </ul>
    </div>
  </div>

  <!-- Page 5: Loyalty & Repeat-Visit Patterns -->
  <div class="page">
    <h2>Loyalty & Repeat-Visit Patterns</h2>

    <div class="comparison-grid">
      <div class="metric-box">
        <h3>Retention Metrics</h3>
        <ul>
          <li><strong>Monthly Retention:</strong> 60%+</li>
          <li><strong>Return Customer Rate:</strong> 45%</li>
        </ul>
      </div>

      <div class="metric-box">
        <h3>Loyalty Tiers</h3>
        <ul>
          <li>Bronze (5+ visits): 10% discount</li>
          <li>Silver (15+ visits): 15% discount</li>
          <li>Gold (30+ visits): 20% discount</li>
          <li>Platinum (50+ visits): 25% discount</li>
        </ul>
      </div>
    </div>

    <div class="highlight-box">
      <p><strong>Customer Lifetime Value:</strong> Loyalty program members have 3x higher lifetime value than one-time visitors, with an average of $450+ per customer over 12 months.</p>
    </div>
  </div>

  <!-- Page 6: POS Integration & QR Companion Flow -->
  <div class="page">
    <h2>POS Integration & QR Companion Flow</h2>

    <p>Hookah+ works seamlessly with your existing POS system (Square, Clover, Toast) as a companion layer that adds intelligence without replacing your current setup.</p>

    <div class="metric-box">
      <h3>POS Integration</h3>
      <p>Sync session data with Square, Clover, or Toast. Hookah+ handles QR ordering, session tracking, and analytics while your POS handles payments.</p>
    </div>

    <div class="metric-box">
      <h3>QR-Based Ordering Workflow</h3>
      <p>Customer scans QR → Selects flavors/add-ons → Order sent to Back of the House → Session tracked automatically → Payment processed via your POS → Analytics captured in real-time.</p>
    </div>

    <div class="cta-box">
      <h3>Ready to Transform Your Lounge?</h3>
      <p style="margin-bottom: 16px;">World Shisha 2026 attendees: Book a free Smart Lounge Simulation for your venue.</p>
      <p style="font-size: 18px; font-weight: bold;">Visit hookahplus.net/world-shisha-2026/pilot-pack</p>
    </div>

    <div class="footer">
      <p>© 2026 HookahPlus. All rights reserved. | hookahplus.net</p>
    </div>
  </div>
</body>
</html>
`;

async function generatePDF() {
  console.log('🚀 Starting PDF generation...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(HTML_CONTENT, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const outputPath = path.join(__dirname, '../public/lead-magnets/smart-lounge-playbook-2026.pdf');
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
      printBackground: true
    });
    
    console.log('✅ PDF generated successfully!');
    console.log(`📄 Location: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  generatePDF().catch(console.error);
}

module.exports = { generatePDF };

