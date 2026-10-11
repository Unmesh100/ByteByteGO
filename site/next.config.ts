import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const isBuild = process.env.NODE_ENV === "production";

/**
 * This machine's LAN IPv4 addresses (e.g. 192.168.x.x), so the dev site also
 * works — scripts, hot reload and all — when opened from a phone on the same Wi-Fi.
 * Next.js blocks dev resources for any other origin by default.
 */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n!.address);

const nextConfig: NextConfig = {
  // Fully static site: every book and chapter is pre-rendered at build time.
  // Only for `next build`: in dev, export mode throws on unknown URLs instead
  // of rendering the 404 page.
  output: isBuild ? "export" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
