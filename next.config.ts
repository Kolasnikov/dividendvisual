import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.dividendvisual.com' }],
        destination: 'https://dividendvisual.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
