import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async headers() {
    return [
      { source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",
            value: "http://localhost:5173",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, OPTIONS",
          },
          {
            key:"Access-Control-Allow-Headers",
            value:"Content-type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
