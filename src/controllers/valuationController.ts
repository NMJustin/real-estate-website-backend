import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getValuations = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuations = await prisma.valuationRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: valuations });
  } catch (error) {
    next(error);
  }
};

export const createValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuation = await prisma.valuationRequest.create({ data: req.body });
    res.status(201).json({ success: true, data: valuation });
  } catch (error) {
    next(error);
  }
};

export const getValuationById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuation = await prisma.valuationRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!valuation) return res.status(404).json({ success: false, message: 'Valuation not found' });
    return res.json({ success: true, data: valuation });
  } catch (error) {
    return next(error);
  }
};

export const updateValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuation = await prisma.valuationRequest.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ success: true, data: valuation });
  } catch (error) {
    next(error);
  }
};
