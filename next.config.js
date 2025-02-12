/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["images.unsplash.com"],
    },
    typescript: {
       ignoreBuildErrors: true,  // TEMPORARY - address these later
    },
  };
  
  module.exports = nextConfig;