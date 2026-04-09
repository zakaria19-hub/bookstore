import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken';

export interface JwtPayload {
    id: string;
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                code: 401,
                error: 'Authorization header required. Use: Bearer <token>',
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new Error('Missing token');
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key';

        const decoded = jwt.verify(token, secret) as JsonWebTokenPayload | string;
        if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
            throw new Error('Invalid token payload');
        }

        req.userId = decoded.id;

        next();
    } catch {
        res.status(401).json({
            success: false,
            code: 401,
            error: 'Invalid or expired token',
        });
    }
};
