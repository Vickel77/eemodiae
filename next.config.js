/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "file/d/1gof38pZDhplOp1XfE4ZowoxkWkg7kP2G/view?usp=sharing",
      },
    ],
  },
};

module.exports = nextConfig;
