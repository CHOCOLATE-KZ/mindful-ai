/** @type {import('next').NextConfig} */
const nextConfig = {
  // Твоя старая настройка для работы с изображениями и новостями
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
      {
        pathname: "/api/news/image",
        search: "?proxy=1&imgUrl=*",
      },
      {
        pathname: "/api/news/image",
        search: "?url=*",
      },
    ],
  },

  // Наша новая настройка Webpack, чтобы не падал билд из-за face-api.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;