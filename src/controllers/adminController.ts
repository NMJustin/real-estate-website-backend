import type { Request, Response } from 'express';

export const getDashboard = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Admin dashboard route placeholder' });
};

export const getUsers = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Admin users route placeholder' });
};
