import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden: Invalid Token' });
            }
            (req as any).user = user;
            next();
        });
    } else {
        // For development ease, we might allow unauthenticated access if configured, 
        // but strictly for this requirement we default to 401
        res.status(401).json({ error: 'Unauthorized: No Token Provided' });
    }
};
