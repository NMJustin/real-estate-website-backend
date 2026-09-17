import type { NextFunction, Request, Response } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing',
    });
  }

  req.user = { id: 'demo-user', role: 'user' } as any;
  return next();
};
