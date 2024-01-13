/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.genius.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'th.bing.com',
                port: '',
                pathname: '/**',
            },
        ],
    }
};

const withBundleAnalyzer = require( '@next/bundle-analyzer' )
    (
        {
            enabled: process.env.ANALYZE === 'true',
        }
    );

module.exports = withBundleAnalyzer( nextConfig );
