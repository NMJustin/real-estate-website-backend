import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Favorite } from '../entities/Favorite.js';
import { Property } from '../entities/Property.js';

export const getFavorites = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id || (typeof req.query.userId === 'string' ? req.query.userId : undefined);
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const favorites = await favoriteRepo.find({
      where: { userId },
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
    return res.json({ success: true, data: favorites });
  } catch (error) {
    return next(error);
  }
};

export const getFavoriteById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { property: true },
    });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    return res.json({ success: true, data: favorite });
  } catch (error) {
    return next(error);
  }
};

export const createFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id || String(req.body.userId || '');
    const propertyId = String(req.body.propertyId || '');
    if (!userId || !propertyId) return res.status(400).json({ success: false, message: 'userId and propertyId are required' });

    const favoriteRepo = AppDataSource.getRepository(Favorite);

    // Check if favorite already exists
    const existing = await favoriteRepo.findOne({ where: { userId, propertyId } });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const favorite = favoriteRepo.create({ userId, propertyId });
    const savedFavorite = await favoriteRepo.save(favorite);
    const favoriteWithProperty = await favoriteRepo.findOne({
      where: { id: savedFavorite.id },
      relations: { property: true },
    });
    return res.status(201).json({ success: true, data: favoriteWithProperty });
  } catch (error) {
    return next(error);
  }
};

export const replaceFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { property: true },
    });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    Object.assign(favorite, req.body);
    const updatedFavorite = await favoriteRepo.save(favorite);
    return res.json({ success: true, data: updatedFavorite });
  } catch (error) {
    return next(error);
  }
};

export const updateFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { property: true },
    });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    Object.assign(favorite, req.body);
    const updatedFavorite = await favoriteRepo.save(favorite);
    return res.json({ success: true, data: updatedFavorite });
  } catch (error) {
    return next(error);
  }
};

export const deleteFavorite = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const favoriteRepo = AppDataSource.getRepository(Favorite);
    const favorite = await favoriteRepo.findOne({ where: { id: String(req.params.id) } });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    await favoriteRepo.remove(favorite);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
