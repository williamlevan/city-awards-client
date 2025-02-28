/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"], // Enables SVG as React component
        });
        return config;
    },
};

export default nextConfig;