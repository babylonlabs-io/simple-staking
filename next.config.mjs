/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
