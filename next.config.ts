import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
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
