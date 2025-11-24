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
 */
export function generateDemoLink(slug: string, baseUrl?: string): string {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
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

