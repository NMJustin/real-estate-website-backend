import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getListings = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listings = await prisma.listingRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listing = await prisma.listingRequest.create({ data: req.body });
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listing = await prisma.listingRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing request not found' });
    return res.json({ success: true, data: listing });
  } catch (error) {
    return next(error);
  }
};

export const updateListing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const listing = await prisma.listingRequest.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};
