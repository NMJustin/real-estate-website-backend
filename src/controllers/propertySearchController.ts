import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { PropertySearch } from '../entities/PropertySearch.js';

const optionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const optionalInteger = (value: unknown) => {
  const parsed = optionalNumber(value);
  return parsed === undefined ? undefined : Math.trunc(parsed);
};

const stringValue = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const createPropertySearch = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>;
    const features = Array.isArray(body.features)
      ? body.features.filter((feature): feature is string => typeof feature === 'string' && feature.trim() !== '')
      : [];

    let minPrice = optionalNumber(body.minPrice);
    let maxPrice = optionalNumber(body.maxPrice);

    if (typeof body.priceRange === 'string') {
      const parts = body.priceRange.split('-');
      if (parts.length === 2) {
        minPrice = optionalNumber(parts[0]);
        maxPrice = optionalNumber(parts[1]);
      } else if (body.priceRange.endsWith('+')) {
        minPrice = optionalNumber(body.priceRange.replace('+', ''));
      }
    }

    let transactionType = stringValue(body.transactionType);
    if (transactionType) {
      const type = transactionType.toUpperCase();
      if (type === 'BUY') transactionType = 'SALE';
      else if (type === 'RENT') transactionType = 'RENT';
    }

    const minBedrooms = optionalInteger(body.minBedrooms) ?? optionalInteger(body.bedrooms);

    const data = {
      userId: req.user?.id,
      email: stringValue(body.email),
      location: stringValue(body.location),
      propertyType: stringValue(body.propertyType),
      transactionType,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms: optionalInteger(body.maxBedrooms),
      minBathrooms: optionalInteger(body.minBathrooms),
      maxBathrooms: optionalInteger(body.maxBathrooms),
      minSize: optionalNumber(body.minSize),
      maxSize: optionalNumber(body.maxSize),
      sizeUnit: stringValue(body.sizeUnit),
      availability: stringValue(body.availability),
      furnishingStatus: stringValue(body.furnishingStatus),
      features,
    };

    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const search = searchRepo.create(data);
    const savedSearch = await searchRepo.save(search);
    return res.status(201).json({ success: true, data: savedSearch });
  } catch (error) {
    return next(error);
  }
};

export const getPropertySearches = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const userId = req.user?.id;
    const where = userId ? { userId } : {};
    const searches = await searchRepo.find({ where, order: { createdAt: 'DESC' } });
    return res.json({ success: true, data: searches });
  } catch (error) {
    return next(error);
  }
};

export const getPropertySearchById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const search = await searchRepo.findOne({ where: { id: String(req.params.id) } });
    if (!search) return res.status(404).json({ success: false, message: 'Property search not found' });
    return res.json({ success: true, data: search });
  } catch (error) {
    return next(error);
  }
};

export const replacePropertySearch = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const search = await searchRepo.findOne({ where: { id: String(req.params.id) } });
    if (!search) return res.status(404).json({ success: false, message: 'Property search not found' });
    Object.assign(search, req.body);
    const updatedSearch = await searchRepo.save(search);
    return res.json({ success: true, data: updatedSearch });
  } catch (error) {
    return next(error);
  }
};

export const updatePropertySearch = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const search = await searchRepo.findOne({ where: { id: String(req.params.id) } });
    if (!search) return res.status(404).json({ success: false, message: 'Property search not found' });
    Object.assign(search, req.body);
    const updatedSearch = await searchRepo.save(search);
    return res.json({ success: true, data: updatedSearch });
  } catch (error) {
    return next(error);
  }
};

export const deletePropertySearch = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    const search = await searchRepo.findOne({ where: { id: String(req.params.id) } });
    if (!search) return res.status(404).json({ success: false, message: 'Property search not found' });
    await searchRepo.remove(search);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};