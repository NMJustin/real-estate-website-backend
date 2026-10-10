import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { ValuationRequest } from '../entities/ValuationRequest.js';

export const getValuations = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuations = await valuationRepo.find({ order: { createdAt: 'DESC' } });
    res.json({ success: true, data: valuations });
  } catch (error) {
    next(error);
  }
};

export const createValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuation = valuationRepo.create(req.body);
    const savedValuation = await valuationRepo.save(valuation);
    res.status(201).json({ success: true, data: savedValuation });
  } catch (error) {
    next(error);
  }
};

export const getValuationById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuation = await valuationRepo.findOne({ where: { id: String(req.params.id) } });
    if (!valuation) return res.status(404).json({ success: false, message: 'Valuation not found' });
    return res.json({ success: true, data: valuation });
  } catch (error) {
    return next(error);
  }
};

const VALUATION_UPDATABLE_FIELDS = [
  'name', 'email', 'phone', 'propertyType', 'location',
  'propertySize', 'bedrooms', 'bathrooms', 'description',
  'estimatedValue', 'status',
] as const;

export const replaceValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuation = await valuationRepo.findOne({ where: { id: String(req.params.id) } });
    if (!valuation) return res.status(404).json({ success: false, message: 'Valuation not found' });
    for (const field of VALUATION_UPDATABLE_FIELDS) {
      if (field in req.body) (valuation as unknown as Record<string, unknown>)[field] = req.body[field];
    }
    const updatedValuation = await valuationRepo.save(valuation);
    res.json({ success: true, data: updatedValuation });
  } catch (error) {
    next(error);
  }
};

export const updateValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuation = await valuationRepo.findOne({ where: { id: String(req.params.id) } });
    if (!valuation) return res.status(404).json({ success: false, message: 'Valuation not found' });
    for (const field of VALUATION_UPDATABLE_FIELDS) {
      if (field in req.body) (valuation as unknown as Record<string, unknown>)[field] = req.body[field];
    }
    const updatedValuation = await valuationRepo.save(valuation);
    res.json({ success: true, data: updatedValuation });
  } catch (error) {
    next(error);
  }
};

export const deleteValuation = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const valuationRepo = AppDataSource.getRepository(ValuationRequest);
    const valuation = await valuationRepo.findOne({ where: { id: String(req.params.id) } });
    if (!valuation) return res.status(404).json({ success: false, message: 'Valuation not found' });
    await valuationRepo.remove(valuation);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
