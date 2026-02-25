import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next.config.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "[res.cloudinary.com</a>",
        pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
