import type { Request, Response } from 'express';

export const getPages = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Get pages route placeholder' });
};

export const getPageBySlug = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Get page by slug route placeholder', slug: req.params.slug });
};
