import { NextRequest, NextResponse } from 'next/server';

/**
 * API Versioning Infrastructure
 * Supports versioned API routes (v1, v2, etc.)
 */

export type ApiVersion = 'v1' | 'v2' | 'latest';

export interface VersionedRequest extends NextRequest {
  apiVersion?: ApiVersion;
}

/**
 * Extract API version from request
 * Checks:
 * 1. URL path: /api/v1/..., /api/v2/...
 * 2. Header: X-API-Version: v1
 * 3. Query param: ?version=v1
 * 4. Default: 'v1'
 */
export function extractApiVersion(req: NextRequest): ApiVersion {
  // Check URL path
  const pathMatch = req.nextUrl.pathname.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    const version = pathMatch[1] as ApiVersion;
    if (version === 'v1' || version === 'v2') {
      return version;
    }
  }

  // Check header
  const headerVersion = req.headers.get('X-API-Version');
  if (headerVersion === 'v1' || headerVersion === 'v2') {
    return headerVersion as ApiVersion;
  }

  // Check query parameter
  const queryVersion = req.nextUrl.searchParams.get('version');
  if (queryVersion === 'v1' || queryVersion === 'v2') {
    return queryVersion as ApiVersion;
  }

  // Default to v1
  return 'v1';
}

/**
 * Wrap API route handler with versioning support
 */
export function withApiVersion<T>(
  handler: (req: VersionedRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const version = extractApiVersion(req);
    const versionedReq = req as VersionedRequest;
    versionedReq.apiVersion = version;

    // Add version to response headers
    const response = await handler(versionedReq);
    response.headers.set('X-API-Version', version);
    response.headers.set('X-API-Deprecated', version === 'v1' ? 'false' : 'false');

    return response;
  };
}

/**
 * Check if version is deprecated
 */
export function isVersionDeprecated(version: ApiVersion): boolean {
  // v1 is current, v2+ would be deprecated when v3 is released
  return false; // Update when deprecating versions
}

/**
 * Get deprecation notice for version
 */
export function getDeprecationNotice(version: ApiVersion): string | null {
  if (isVersionDeprecated(version)) {
    return `API version ${version} is deprecated. Please migrate to the latest version.`;
  }
  return null;
}

/**
 * Create versioned route handler
 * Usage:
 * export const GET = createVersionedRoute({
 *   v1: async (req) => { ... },
 *   v2: async (req) => { ... },
 * });
 */
export function createVersionedRoute<T>(handlers: {
  v1: (req: VersionedRequest) => Promise<NextResponse<T>>;
  v2?: (req: VersionedRequest) => Promise<NextResponse<T>>;
  latest?: (req: VersionedRequest) => Promise<NextResponse<T>>;
}) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const version = extractApiVersion(req);
    const versionedReq = req as VersionedRequest;
    versionedReq.apiVersion = version;

    // Route to appropriate handler
    let handler = handlers[version];
    
    // Fallback to latest if version not found
    if (!handler && handlers.latest) {
      handler = handlers.latest;
    }

    // Fallback to v1 if no handler found
    if (!handler) {
      handler = handlers.v1;
    }

    const response = await handler(versionedReq);
    response.headers.set('X-API-Version', version);
    
    const deprecationNotice = getDeprecationNotice(version);
    if (deprecationNotice) {
      response.headers.set('X-API-Deprecation-Notice', deprecationNotice);
    }

    return response;
  };
}

