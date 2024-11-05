import winston from 'winston';
import dotenv from 'dotenv';
import config from '../config/appConfig.js';

const { logLevel } = config;

dotenv.config();

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