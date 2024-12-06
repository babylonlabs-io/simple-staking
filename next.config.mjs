/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "assets.leapwallet.io",
      },
    ],
  },
};

export default nextConfig;
