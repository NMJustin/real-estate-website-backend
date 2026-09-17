import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getServices = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try { const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }); res.json({ success: true, data: services }); } catch (error) { next(error); }
};

export const getServiceBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const service = await prisma.service.findUnique({ where: { slug: String(req.params.slug) } }); if (!service) return res.status(404).json({ success: false, message: 'Service not found' }); return res.json({ success: true, data: service }); } catch (error) { return next(error); }
};

export const createService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const service = await prisma.service.create({ data: req.body }); res.status(201).json({ success: true, data: service }); } catch (error) { next(error); }
};

export const replaceService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const service = await prisma.service.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: service }); } catch (error) { next(error); }
};

export const updateService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const service = await prisma.service.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: service }); } catch (error) { next(error); }
};

export const deleteService = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { await prisma.service.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); } catch (error) { next(error); }
};
