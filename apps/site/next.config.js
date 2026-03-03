/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Temporarily disabled for Windows symlink issues
  images: {
    // Use unoptimized images to prevent 400 errors from image optimization API
    // This bypasses Next.js image optimization which is causing 400 errors
    unoptimized: true,
  },

  /**
   * Production routing note:
   * `hookahplus.net` is the marketing/site app. Square + app APIs live in the app deployment.
   * These rewrites proxy API requests so Square endpoints do NOT 404 on the root domain.
   *
   * IMPORTANT: Rewrites preserve HTTP method/body (safe for webhooks + OAuth callbacks).
   */
  async rewrites() {
    // The deployed app backend (Vercel project). Keep in sync with Vercel env.
    const appBase =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/g, "") ||
      "https://hookahplus-app-prod.vercel.app";

    return [
      // --- Square OAuth (legacy /apps/web-style paths) -> app implementation ---
      {
        source: "/api/integrations/square/oauth/start",
        destination: `${appBase}/api/square/oauth/authorize`,
      },
      {
        source: "/api/integrations/square/oauth/callback",
        destination: `${appBase}/api/square/oauth/callback`,
      },
      {
        source: "/api/integrations/square/connection-check",
        destination: `${appBase}/api/square/status`,
      },
      {
        source: "/api/integrations/square/disconnect",
        destination: `${appBase}/api/square/disconnect`,
      },

      // --- Square webhooks (root domain URL) -> app webhook handler ---
      {
        source: "/api/webhooks/square",
        destination: `${appBase}/api/square/webhook`,
      },

      // --- Direct app Square endpoints, proxied for convenience ---
      {
        source: "/api/square/:path*",
        destination: `${appBase}/api/square/:path*`,
      },
    ];
  },

  async redirects() {
    const appBase =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/g, "") ||
      "https://hookahplus-app-prod.vercel.app";

    return [
      // --- App UI surfaces live in the app deployment, not the marketing site ---
      // These redirects prevent 404 confusion when people type app URLs on hookahplus.net.
      {
        source: "/launchpad",
        destination: `${appBase}/launchpad`,
        permanent: false,
      },
      {
        source: "/staff-panel",
        destination: `${appBase}/staff-panel`,
        permanent: false,
      },
      {
        source: "/fire-session-dashboard",
        destination: `${appBase}/fire-session-dashboard`,
        permanent: false,
      },
      {
        source: "/analytics",
        destination: `${appBase}/analytics`,
        permanent: false,
      },
      {
        source: "/demo/:path*",
        destination: `${appBase}/demo/:path*`,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: `${appBase}/admin/:path*`,
        permanent: false,
      },

      // Legacy "connected/error" pages used by older Square docs/scripts.
      // Keep these as redirects (GET only) to avoid 404 confusion.
      {
        source: "/integrations/square/connected",
        destination: `${appBase}/square/settings?connected=true`,
        permanent: false,
      },
      {
        source: "/integrations/square/error",
        destination: `${appBase}/square/connect`,
        permanent: false,
      },
      // If someone visits the API callback directly in browser without params, send them to connect.
      {
        source: "/api/integrations/square/oauth/callback",
        has: [{ type: "query", key: "code", value: "" }],
        destination: `${appBase}/square/connect`,
        permanent: false,
      },
    ];
  },
}

module.exports = nextConfig
