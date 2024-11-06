import 'dotenv/config';

// Project configuration, includes cache parameters, JWT secret, logging level, and port
const config = {
    cacheTTL: process.env.CACHE_TTL || 600,
    jwtSecret: process.env.JWT_SECRET,
    logLevel: process.env.LOG_LEVEL || 'info',
    port: process.env.PORT || 3000
};

const { cacheTTL, logLevel } = config;

export { cacheTTL, logLevel };
export default config;
