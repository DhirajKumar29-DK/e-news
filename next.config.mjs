/** @type {import('next').NextConfig} */
const rawBackend = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  'https://backendnews.aiwcrm.in'
).replace(/\/$/, '');

const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['10.0.2.2', '10.0.2.2:3000', '192.168.29.222', '192.168.29.222:3000', 'localhost:3000'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${rawBackend}/api/:path*`
      },
      {
        source: '/backend-uploads/:path*',
        destination: `${rawBackend}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
