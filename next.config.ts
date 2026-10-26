import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'whatsapp-web.js',
    'puppeteer',
    'puppeteer-core',
    'playwright',
    'playwright-core',
    'unzipper',
  ],
};

export default nextConfig;
