import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAdminProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const properties = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } }); res.json({ success: true, data: properties, filters: req.query }); } catch (error) { next(error); }
};

export const getAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.findUnique({ where: { id: String(req.params.id) } }); if (!property) return res.status(404).json({ success: false, message: 'Property not found' }); return res.json({ success: true, data: property }); } catch (error) { return next(error); }
};

export const createAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.create({ data: req.body }); res.status(201).json({ success: true, data: property }); } catch (error) { next(error); }
};

export const replaceAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: property }); } catch (error) { next(error); }
};

export const updateAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: property }); } catch (error) { next(error); }
};

export const deleteAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.update({ where: { id: String(req.params.id) }, data: { status: 'ARCHIVED' } }); res.json({ success: true, data: property }); } catch (error) { next(error); }
};
