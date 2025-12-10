import { NextRequest, NextResponse } from 'next/server';
import { normalizeInstagramUrl, processInstagramLead } from '../../../../../lib/instagram-scraper';

/**
 * POST /api/admin/operator-onboarding/extract-social
 * 
 * Extract business information from social media links
 * Supports: Instagram, Facebook, Website
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instagramUrl, facebookUrl, websiteUrl } = body;

    if (!instagramUrl && !facebookUrl && !websiteUrl) {
      return NextResponse.json({
        success: false,
        error: 'At least one social media link is required'
      }, { status: 400 });
    }

    const extracted: any = {
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      location: '',
      instagramUrl: instagramUrl || '',
      facebookUrl: facebookUrl || '',
      websiteUrl: websiteUrl || ''
    };

    // Extract from Instagram
    if (instagramUrl) {
      try {
        const normalized = normalizeInstagramUrl(instagramUrl);
        if (normalized) {
          extracted.instagramUrl = normalized;
          
          // Try to extract business name from Instagram username
          const usernameMatch = normalized.match(/instagram\.com\/([^\/\?]+)/);
          if (usernameMatch) {
            const username = usernameMatch[1];
            // Convert username to potential business name (capitalize, remove underscores)
            const potentialName = username
              .replace(/[_-]/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            if (!extracted.businessName) {
              extracted.businessName = potentialName;
            }
          }

          // Process Instagram for menu data (async, non-blocking)
          try {
            const instagramData = await processInstagramLead(normalized);
            if (instagramData) {
              // Store Instagram scraped data for later use
              extracted.instagramScrapedData = instagramData;
            }
          } catch (scrapeError) {
            console.warn('[Extract Social] Instagram scraping failed (non-blocking):', scrapeError);
          }
        }
      } catch (error) {
        console.error('[Extract Social] Instagram processing error:', error);
      }
    }

    // Extract from Facebook
    if (facebookUrl) {
      try {
        // Normalize Facebook URL
        let normalized = facebookUrl.trim();
        if (!normalized.startsWith('http')) {
          normalized = `https://${normalized}`;
        }
        extracted.facebookUrl = normalized;

        // Try to extract business name from Facebook URL
        const pageMatch = normalized.match(/facebook\.com\/([^\/\?]+)/);
        if (pageMatch) {
          const pageSlug = pageMatch[1];
          // Convert page slug to potential business name
          const potentialName = pageSlug
            .replace(/[_-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          if (!extracted.businessName) {
            extracted.businessName = potentialName;
          }
        }
      } catch (error) {
        console.error('[Extract Social] Facebook processing error:', error);
      }
    }

    // Extract from Website
    if (websiteUrl) {
      try {
        // Normalize website URL
        let normalized = websiteUrl.trim();
        if (!normalized.startsWith('http')) {
          normalized = `https://${normalized}`;
        }
        extracted.websiteUrl = normalized;

        // Try to extract business name from domain
        try {
          const url = new URL(normalized);
          const hostname = url.hostname.replace('www.', '');
          const domainParts = hostname.split('.');
          
          // Use the main domain name (before .com, .net, etc.)
          if (domainParts.length >= 2) {
            const mainDomain = domainParts[domainParts.length - 2];
            const potentialName = mainDomain
              .replace(/[_-]/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            if (!extracted.businessName) {
              extracted.businessName = potentialName;
            }
          }
        } catch (urlError) {
          console.warn('[Extract Social] URL parsing error:', urlError);
        }

        // Fetch website and extract contact information
        try {
          const response = await fetch(normalized, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (response.ok) {
            const html = await response.text();
            
            // Extract phone number (common patterns)
            const phonePatterns = [
              /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
              /(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
              /(\d{3})\.(\d{3})\.(\d{4})/g
            ];
            
            for (const pattern of phonePatterns) {
              const matches = html.match(pattern);
              if (matches && matches.length > 0) {
                // Use the first phone number found, clean it up
                const phone = matches[0].replace(/[^\d+()-]/g, '').trim();
                if (phone.length >= 10) {
                  extracted.phone = phone;
                  break;
                }
              }
            }
            
            // Extract address (look for common address patterns)
            const addressPatterns = [
              /(\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Circle|Cir)[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5})/gi,
              /(\d+\s+[A-Za-z0-9\s,]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5})/gi
            ];
            
            for (const pattern of addressPatterns) {
              const matches = html.match(pattern);
              if (matches && matches.length > 0) {
                extracted.location = matches[0].trim();
                break;
              }
            }
            
            // Extract business name from <title> tag
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && !extracted.businessName) {
              const title = titleMatch[1]
                .replace(/\s*[-|]\s*.*$/, '') // Remove everything after dash/pipe
                .replace(/\s*-\s*.*$/, '')
                .trim();
              if (title.length > 0 && title.length < 100) {
                extracted.businessName = title;
              }
            }
            
            // Try to find contact page and extract more info
            const contactPageMatch = normalized.match(/^https?:\/\/[^\/]+/);
            if (contactPageMatch) {
              const baseUrl = contactPageMatch[0];
              const contactUrls = [
                `${baseUrl}/contact`,
                `${baseUrl}/contact-us`,
                `${baseUrl}/contact.html`
              ];
              
              // Try contact page (non-blocking, don't wait)
              Promise.all(contactUrls.map(async (contactUrl) => {
                try {
                  const contactResponse = await fetch(contactUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(5000)
                  });
                  if (contactResponse.ok) {
                    const contactHtml = await contactResponse.text();
                    
                    // Extract phone if not found yet
                    if (!extracted.phone) {
                      for (const pattern of phonePatterns) {
                        const matches = contactHtml.match(pattern);
                        if (matches && matches.length > 0) {
                          const phone = matches[0].replace(/[^\d+()-]/g, '').trim();
                          if (phone.length >= 10) {
                            extracted.phone = phone;
                            break;
                          }
                        }
                      }
                    }
                    
                    // Extract address if not found yet
                    if (!extracted.location) {
                      for (const pattern of addressPatterns) {
                        const matches = contactHtml.match(pattern);
                        if (matches && matches.length > 0) {
                          extracted.location = matches[0].trim();
                          break;
                        }
                      }
                    }
                  }
                } catch (e) {
                  // Ignore contact page fetch errors
                }
              })).catch(() => {
                // Ignore errors
              });
            }
          }
        } catch (fetchError) {
          console.warn('[Extract Social] Website fetch error (non-blocking):', fetchError);
          // Continue without website data
        }
      } catch (error) {
        console.error('[Extract Social] Website processing error:', error);
      }
    }

    // Return extracted data
    return NextResponse.json({
      success: true,
      extracted,
      message: 'Information extracted from social media links',
      note: 'Some fields may be empty. Fill them manually if needed.'
    });

  } catch (error) {
    console.error('[Extract Social] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to extract information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

