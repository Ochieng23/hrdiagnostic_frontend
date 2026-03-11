const defaultApiUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api/v1' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || defaultApiUrl,
  },
};
module.exports = nextConfig;
