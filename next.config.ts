import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// In development the site is opened through the HTTPS tunnel registered in Shopify, whose host is
// APP_ORIGIN's. Next's dev server blocks dev-only requests from hosts it doesn't know.
function getDevOrigins(): string[] {
  try {
    return process.env.APP_ORIGIN ? [new URL(process.env.APP_ORIGIN).host] : [];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getDevOrigins(),
  experimental: {
    agentFeedback: true,
  },
  images: {
    // Product images are served from Shopify's CDN.
    remotePatterns: [{protocol: "https", hostname: "cdn.shopify.com"}],
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default withNextIntl(nextConfig);
