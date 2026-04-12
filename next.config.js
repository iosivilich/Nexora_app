/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async rewrites() {
    return [
      { 
        source: '/((?!api|_next/static|_next/image|assets|.*\\.).*)', 
        destination: '/index.html' 
      }
    ];
  }
};

module.exports = nextConfig;
