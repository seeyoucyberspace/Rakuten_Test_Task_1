import NodeCache from 'node-cache';
import { cacheTTL } from '../config/appConfig.js';

// Cache with a set TTL for storing intermediate data
const cache = new NodeCache({ stdTTL: cacheTTL });

export default cache;