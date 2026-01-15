import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'mcp-gateway' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/audit.log' }), // GDPR/KVKK Audit Log
        new winston.transports.Console()
    ],
});

export const complianceLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Capture the username if authenticated
    const user = (req as any).user ? (req as any).user.username : 'anonymous';

    // Mask sensitive PII in body if necessary (simplified example)
    const sanitize = (body: any) => {
        if (!body) return {};
        const sanitized = { ...body };
        if (sanitized.password) sanitized.password = '***';
        if (sanitized.token) sanitized.token = '***';
        return sanitized;
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            timestamp: new Date().toISOString(),
            event: 'API_REQUEST',
            user: user, // KVKK: Who
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            // body: sanitize(req.body) // Enable with caution for GDPR
        });
    });

    next();
};

export { logger };
