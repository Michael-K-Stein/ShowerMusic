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
    },
}

module.exports = nextConfig
