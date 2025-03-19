import nextConfig from "@pfl-wsr/configs/next";
import { merge } from "lodash-es";
import { type NextConfig } from "next";

export default merge(nextConfig, {
  images: {
    remotePatterns: [
      {
        hostname: "github-readme-stats.vercel.app",
      },
      {
        hostname: "github-readme-streak-stats.herokuapp.com",
      },
      {
        hostname: "skillicons.dev",
      },
    ],
    dangerouslyAllowSVG: true,
  },
} satisfies NextConfig);
