/**
 * PDF Generator for Staff Playbook
 * 
 * Generates PDF from HTML content
 * TODO: Install puppeteer: npm install puppeteer @types/puppeteer
 */

/**
 * Generate PDF from HTML content
 * Requires puppeteer to be installed
 */
export async function generatePDFFromHTML(
  html: string,
  options?: {
    format?: 'A4' | 'Letter';
    margin?: { top: string; right: string; bottom: string; left: string };
  }
): Promise<Buffer | null> {
  try {
    let puppeteer: any;
    try {
      const mod: any = await import("puppeteer");
      puppeteer = mod?.default ?? mod;
    } catch {
      console.warn('[PDF Generator] Puppeteer not installed. Install with: npm install puppeteer');
      return null;
    }

    if (!puppeteer) {
      console.warn('[PDF Generator] Puppeteer not installed. Install with: npm install puppeteer');
      return null;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: options?.format || 'A4',
      margin: options?.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdf);
  } catch (error) {
    console.error('[PDF Generator] Error:', error);
    return null;
  }
}

/**
 * Check if PDF generation is available
 */
export async function isPDFGenerationAvailable(): Promise<boolean> {
  try {
    const mod: any = await import("puppeteer");
    const puppeteer = mod?.default ?? mod;
    return puppeteer !== null && puppeteer !== undefined;
  } catch {
    return false;
  }
}

