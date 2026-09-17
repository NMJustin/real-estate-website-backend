import type { Request, Response } from 'express';

export const getFavorites = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Get favorites route placeholder' });
};

export const createFavorite = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Create favorite route placeholder' });
};

export const deleteFavorite = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Delete favorite route placeholder', id: req.params.id });
};
