/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
      config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
      });

      // Handle binary files (e.g., .node files)
      config.module.rules.push({
          test: /\.node$/,
          use: 'node-loader',
      });

      return config;
  },
  typescript: {
      ignoreBuildErrors: true,  //Keep this while testing.
  },
}

module.exports = nextConfig