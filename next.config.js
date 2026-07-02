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
  async rewrites() {
    return [
      { source: "/dvc", destination: "/dvc/index.html" },
      { source: "/dvc/", destination: "/dvc/index.html" },
      { source: "/dvc/july", destination: "/dvc/july.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/july.html", destination: "/dvc/july", permanent: false },
    ];
  },
};

module.exports = nextConfig;
