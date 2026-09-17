import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getViewings = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewings = await prisma.viewingRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: viewings });
  } catch (error) {
    next(error);
  }
};

export const createViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewing = await prisma.viewingRequest.create({ data: { ...req.body, propertyId: String(req.body.propertyId) } });
    res.status(201).json({ success: true, data: viewing });
  } catch (error) {
    next(error);
  }
};

export const getViewingById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewing = await prisma.viewingRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });
    return res.json({ success: true, data: viewing });
  } catch (error) {
    return next(error);
  }
};

export const updateViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const viewing = await prisma.viewingRequest.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ success: true, data: viewing });
  } catch (error) {
    next(error);
  }
};

export const deleteViewing = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    await prisma.viewingRequest.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
