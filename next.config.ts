import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  // Make server-side env vars available to API routes
  serverExternalPackages: ["@anthropic-ai/sdk"],
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ECQO_MODERATOR_EMAIL: process.env.ECQO_MODERATOR_EMAIL,
    ECQO_LOW_CONCERN_MAX: process.env.ECQO_LOW_CONCERN_MAX,
    ECQO_MODERATE_UNEASE_MAX: process.env.ECQO_MODERATE_UNEASE_MAX,
    ECQO_REASSESS_LOW_CONCERN: process.env.ECQO_REASSESS_LOW_CONCERN,
    ECQO_REASSESS_MODERATE_UNEASE: process.env.ECQO_REASSESS_MODERATE_UNEASE,
    ECQO_TIER1_NOTIFY_SECONDS: process.env.ECQO_TIER1_NOTIFY_SECONDS,
    ECQO_TIER2_NOTIFY_HOURS: process.env.ECQO_TIER2_NOTIFY_HOURS,
  },
};

export default nextConfig;
