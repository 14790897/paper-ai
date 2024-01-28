/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/chat/completions", // 用户访问的路径
        destination: "/api/chat", // 实际上被映射到的路径
      },
      {
        source: "/api/paper", // 另一个用户访问的路径
        destination: "/api/chat", // 同样被映射到 common-route
      },
    ];
  },
};

module.exports = nextConfig;
