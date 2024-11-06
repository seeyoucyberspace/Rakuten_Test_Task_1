import winston from 'winston';
import 'dotenv/config';
import { logLevel } from '../config/appConfig.js';

// Logger for logging to console and file
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'app.log' })
    ],
});

export default logger;