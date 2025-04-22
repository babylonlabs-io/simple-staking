/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: "export",
  images: { unoptimized: true },
  productionBrowserSourceMaps: true,
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
