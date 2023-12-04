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
        ],
    },
}

module.exports = nextConfig
