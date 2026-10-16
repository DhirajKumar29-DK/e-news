/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['10.0.2.2', '10.0.2.2:3000', '192.168.29.222', '192.168.29.222:3000', 'localhost:3000'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://e-news-backend.onrender.com/api/:path*'
      },
      {
        source: '/backend-uploads/:path*',
        destination: 'https://e-news-backend.onrender.com/uploads/:path*'
      }
    ];
  }
};

export default nextConfig;
