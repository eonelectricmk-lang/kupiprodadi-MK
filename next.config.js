/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname
  }
}

module.exports = nextConfig
