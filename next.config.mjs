/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*'
      }
    ];
  }
};

export default nextConfig;
