import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const numberQuery = (value: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const query = req.query;
    const where: Prisma.PropertyWhereInput = {};
    const and: Prisma.PropertyWhereInput[] = [];

    if (typeof query.location === 'string') and.push({ location: { contains: query.location, mode: 'insensitive' } });
    if (typeof query.district === 'string') and.push({ district: { contains: query.district, mode: 'insensitive' } });
    if (typeof query.sector === 'string') and.push({ sector: { contains: query.sector, mode: 'insensitive' } });
    if (typeof query.propertyType === 'string') where.propertyType = query.propertyType;
    if (typeof query.transactionType === 'string') where.transactionType = query.transactionType;
    if (typeof query.status === 'string') where.status = query.status;
    if (query.featured === 'true') where.isFeatured = true;
    if (query.newDevelopment === 'true') where.isNewDevelopment = true;

    const minPrice = numberQuery(query.minPrice);
    const maxPrice = numberQuery(query.maxPrice);
    const minSize = numberQuery(query.minSize);
    const maxSize = numberQuery(query.maxSize);
    if (minPrice !== undefined || maxPrice !== undefined) where.price = { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) };
    if (minSize !== undefined || maxSize !== undefined) where.size = { ...(minSize !== undefined ? { gte: minSize } : {}), ...(maxSize !== undefined ? { lte: maxSize } : {}) };
    const bedrooms = numberQuery(query.bedrooms);
    const bathrooms = numberQuery(query.bathrooms);
    if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
    if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms };
    if (and.length) where.AND = and;

    const page = Math.max(1, numberQuery(query.page) || 1);
    const limit = Math.min(100, Math.max(1, numberQuery(query.limit) || 20));
    const properties = await prisma.property.findMany({
      where,
      include: { category: true, agent: true, development: true, propertyImages: true, propertyFeatures: { include: { feature: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: typeof query.sort === 'string' && query.sort === 'price' ? { price: 'asc' } : { createdAt: 'desc' },
    });

    res.json({ success: true, data: properties, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getPropertyBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const slug = String(req.params.slug);
    const property = await prisma.property.findUnique({
      where: { slug },
      include: { category: true, agent: true, development: true, propertyImages: true, propertyFeatures: { include: { feature: true } } },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
};

export const getPropertiesByFilter = (filter: string, req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Get ${filter} properties route placeholder`,
    filters: { ...req.query, preset: filter },
  });
};

export const getForSaleProperties = (req: Request, res: Response) => getPropertiesByFilter('for-sale', req, res);
export const getForRentProperties = (req: Request, res: Response) => getPropertiesByFilter('for-rent', req, res);
export const getForLeaseProperties = (req: Request, res: Response) => getPropertiesByFilter('for-lease', req, res);
export const getResidentialProperties = (req: Request, res: Response) => getPropertiesByFilter('residential', req, res);
export const getCommercialProperties = (req: Request, res: Response) => getPropertiesByFilter('commercial', req, res);
export const getLandProperties = (req: Request, res: Response) => getPropertiesByFilter('land', req, res);
export const getNewDevelopmentProperties = (req: Request, res: Response) => getPropertiesByFilter('new-developments', req, res);

export const createProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const property = await prisma.property.create({ data: req.body });
    return res.status(201).json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
};
