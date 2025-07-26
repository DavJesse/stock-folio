// Set environment flags
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const nextConfig = {
  /**
   * Configure HTTP response headers for all routes.
   * Adjusts Content Security Policy depending on environment.
   */
  async headers() {
    return [
      {
        source: '/(.*)', // Match all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDev || isTest
              ? (
                  // Relaxed CSP for development/testing to allow inline and eval scripts
                  "default-src 'self'; connect-src 'self' wss://ws.finnhub.io https://finnhub.io; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
                )
              : (
                  // Strict CSP for production to improve security
                  "default-src 'self'; connect-src 'self' wss://ws.finnhub.io https://finnhub.io; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
                ),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME-sniffing
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Disallow embedding in iframes
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin', // Only send referrer for same-origin
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Restrict browser features
          },
        ],
      },
    ];
  },
};

export default nextConfig;
