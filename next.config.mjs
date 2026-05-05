/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  webpack(config) {
    config.resolve.alias["plotly.js/dist/plotly"] = "plotly.js-dist-min";
    return config;
  },
};

export default nextConfig;
