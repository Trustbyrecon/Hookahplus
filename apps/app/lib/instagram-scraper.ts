/**
 * Instagram Menu Scraper
 * 
 * Scrapes Instagram posts/pages for hookah menu information
 * Extracts: menu items, prices, flavors, base prices, refill prices
 */

interface ScrapedMenuData {
  menuItems?: Array<{
    name: string;
    price?: number;
    description?: string;
  }>;
  flavors?: string[];
  basePrice?: number;
  refillPrice?: number;
  menuLink?: string;
  extractedAt: string;
  source: string;
}

/**
 * Extract Instagram URL from various formats
 */
export function normalizeInstagramUrl(url: string): string | null {
  if (!url) return null;
  
  // Handle various Instagram URL formats
  const patterns = [
    /instagram\.com\/([a-zA-Z0-9_.]+)/,
    /instagr\.am\/([a-zA-Z0-9_.]+)/,
    /^@?([a-zA-Z0-9_.]+)$/ // Just username
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const username = match[1].replace('@', '');
      return `https://www.instagram.com/${username}/`;
    }
  }
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  return null;
}

/**
 * Scrape Instagram for menu data
 * 
 * Note: Instagram's API requires authentication. For production, consider:
 * - Using Instagram Basic Display API
 * - Using a third-party service (e.g., Apify, ScraperAPI)
 * - Manual review workflow for now
 * 
 * This function provides a structure for future implementation.
 */
export async function scrapeInstagramMenu(instagramUrl: string): Promise<ScrapedMenuData | null> {
  try {
    const normalizedUrl = normalizeInstagramUrl(instagramUrl);
    if (!normalizedUrl) {
      console.warn('[Instagram Scraper] Invalid Instagram URL:', instagramUrl);
      return null;
    }

    console.log('[Instagram Scraper] Scraping Instagram URL:', normalizedUrl);

    // TODO: Implement actual scraping
    // Options:
    // 1. Use Instagram Basic Display API (requires OAuth)
    // 2. Use third-party scraping service
    // 3. Use headless browser (Puppeteer/Playwright) - may violate ToS
    // 4. Manual review workflow (current approach)
    
    // For now, return structure indicating scraping is needed
    // In production, this would:
    // - Fetch Instagram posts
    // - Use OCR/image recognition for menu images
    // - Extract text from captions
    // - Parse prices and menu items
    // - Identify flavors from images/text
    
    return {
      menuLink: normalizedUrl,
      extractedAt: new Date().toISOString(),
      source: 'instagram',
      // Placeholder - actual scraping would populate these
      menuItems: [],
      flavors: [],
      // Note: Prices would be extracted from images/captions
    };
  } catch (error) {
    console.error('[Instagram Scraper] Error scraping Instagram:', error);
    return null;
  }
}

/**
 * Extract menu data from Instagram post caption or image
 * Uses keyword matching to identify menu items, prices, flavors
 */
export function extractMenuDataFromText(text: string): Partial<ScrapedMenuData> {
  const extracted: Partial<ScrapedMenuData> = {
    menuItems: [],
    flavors: [],
  };

  // Common hookah flavor keywords
  const flavorKeywords = [
    'blue mist', 'double apple', 'mint', 'strawberry', 'peach', 'watermelon',
    'grape', 'pineapple', 'orange', 'lemon', 'cherry', 'vanilla', 'coconut',
    'rose', 'jasmine', 'lavender', 'honey', 'cinnamon', 'chocolate'
  ];

  // Extract flavors
  const lowerText = text.toLowerCase();
  flavorKeywords.forEach(flavor => {
    if (lowerText.includes(flavor)) {
      extracted.flavors?.push(flavor.charAt(0).toUpperCase() + flavor.slice(1));
    }
  });

  // Extract prices (look for $XX.XX patterns)
  const pricePattern = /\$(\d+\.?\d*)/g;
  const prices: number[] = [];
  let match;
  while ((match = pricePattern.exec(text)) !== null) {
    const price = parseFloat(match[1]);
    if (price > 0 && price < 1000) { // Reasonable price range
      prices.push(price);
    }
  }

  // If we found prices, assume first is base price
  if (prices.length > 0) {
    extracted.basePrice = prices[0];
    if (prices.length > 1) {
      extracted.refillPrice = prices[1];
    }
  }

  // Extract menu items (look for numbered lists or item names)
  const menuItemPatterns = [
    /(\d+\.?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*-\s*\$(\d+\.?\d*)/g
  ];

  menuItemPatterns.forEach(pattern => {
    let itemMatch;
    while ((itemMatch = pattern.exec(text)) !== null) {
      const name = itemMatch[2] || itemMatch[1];
      const price = itemMatch[3] ? parseFloat(itemMatch[3]) : undefined;
      if (name && name.length > 2) {
        extracted.menuItems?.push({
          name: name.trim(),
          price,
        });
      }
    }
  });

  return extracted;
}

/**
 * Process Instagram URL for a lead
 * Called when a lead is created with an Instagram URL
 */
export async function processInstagramLead(instagramUrl: string): Promise<Partial<ScrapedMenuData>> {
  try {
    // Scrape Instagram
    const scrapedData = await scrapeInstagramMenu(instagramUrl);
    
    if (!scrapedData) {
      return {
        menuLink: instagramUrl,
        extractedAt: new Date().toISOString(),
        source: 'instagram',
      };
    }

    // If we have text data, extract menu information
    // In a real implementation, this would come from Instagram API or scraping
    // For now, return the structure
    
    return scrapedData;
  } catch (error) {
    console.error('[Instagram Scraper] Error processing Instagram lead:', error);
    return {
      menuLink: instagramUrl,
      extractedAt: new Date().toISOString(),
      source: 'instagram',
    };
  }
}

