import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getFavorites = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id || (typeof req.query.userId === 'string' ? req.query.userId : undefined);
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const favorites = await prisma.favorite.findMany({ where: { userId }, include: { property: true }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: favorites });
  } catch (error) {
    return next(error);
  }
};

export const createFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id || String(req.body.userId || '');
    const propertyId = String(req.body.propertyId || '');
    if (!userId || !propertyId) return res.status(400).json({ success: false, message: 'userId and propertyId are required' });
    const favorite = await prisma.favorite.upsert({ where: { userId_propertyId: { userId, propertyId } }, update: {}, create: { userId, propertyId }, include: { property: true } });
    return res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    return next(error);
  }
};

export const deleteFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    await prisma.favorite.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
