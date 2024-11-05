import NodeCache from 'node-cache';
import config from '../config/appConfig.js';

const { cacheTTL } = config;

// Cache with a set TTL for storing intermediate data
const cache = new NodeCache({ stdTTL: cacheTTL });

export default cache;