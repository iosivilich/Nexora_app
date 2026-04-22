/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.VERCEL ? { distDir: 'dist' } : {}),
}

export default nextConfig
