/**
 * Demo Session Utilities
 * Helper functions for creating and managing demo sessions/test links
 */

/**
 * Generate a URL-safe slug from a business name
 */
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * Generate demo link URL
 * Always uses production URL when available, never localhost for email links
 */
export function generateDemoLink(slug: string, baseUrl?: string): string {
  // Priority: baseUrl > NEXT_PUBLIC_APP_URL > production URL > localhost (dev only)
  let appUrl = baseUrl;
  
  if (!appUrl) {
    appUrl = process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // If still no URL and we're in production, use production domain
  if (!appUrl && process.env.NODE_ENV === 'production') {
    appUrl = 'https://app.hookahplus.net';
  }
  
  // Last resort: localhost (only for local dev)
  if (!appUrl) {
    appUrl = 'http://localhost:3002';
    console.warn('[generateDemoLink] Using localhost - set NEXT_PUBLIC_APP_URL for production');
  }
  
  // Never use localhost in production
  if (appUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.error('[generateDemoLink] ERROR: localhost URL detected in production! Using fallback.');
    appUrl = 'https://app.hookahplus.net';
  }
  
  return `${appUrl}/demo/${slug}`;
}

/**
 * Find or create a tenant for demo purposes
 * Returns the tenant ID
 */
export async function findOrCreateDemoTenant(
  businessName: string,
  prisma: any
): Promise<string> {
  // Generate slug for lookup
  const slug = generateSlug(businessName);
  
  // Try to find existing tenant by name (case-insensitive)
  let tenant = await prisma.tenant.findFirst({
    where: {
      name: {
        equals: businessName,
        mode: 'insensitive'
      }
    }
  });

  // If not found, create new tenant
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: businessName.trim(),
      }
    });
  }

  return tenant.id;
}

/**
 * Injects extracted menu data into demo tenant configuration
 * This makes the menu data available when the demo link is opened
 */
export async function injectMenuDataIntoDemo(tenantId: string, menuData: any) {
  try {
    // For now, we'll store menu data in a separate table or tenant metadata
    // In the future, this could update tenant configuration, flavor lists, etc.
    
    // Option 1: Store in a tenant_config table (if it exists)
    // Option 2: Store in tenant metadata JSON field (if it exists)
    // Option 3: Create demo-specific session data
    
    // For now, we'll just log it - the actual injection will happen when demo session loads
    // The demo session can read extractedMenuData from the lead payload
    console.log('[Demo] Menu data prepared for injection:', {
      tenantId,
      hasBasePrice: !!menuData.basePrice,
      hasRefillPrice: !!menuData.refillPrice,
      flavorsCount: menuData.flavors?.length || 0,
      sectionsCount: menuData.sections?.length || 0,
      menuItemsCount: menuData.menuItems?.length || 0
    });
    
    // TODO: In future, create/update tenant_config or flavor_lists tables
    // For now, the demo session will read from lead.extractedMenuData
    
    return { success: true };
  } catch (error) {
    console.error('[Demo] Error injecting menu data:', error);
    // Non-critical - continue anyway
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

