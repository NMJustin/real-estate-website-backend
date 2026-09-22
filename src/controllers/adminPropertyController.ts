import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const propertyInclude = { agent: { select: { id: true, name: true } }, category: { select: { id: true, name: true } }, propertyImages: { orderBy: { displayOrder: 'asc' as const } } };
const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const optionalString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const optionalNumber = (value: unknown) => value === '' || value === undefined || value === null || !Number.isFinite(Number(value)) ? null : Number(value);
const imageData = (images: unknown) => Array.isArray(images) ? images.filter((value): value is string => typeof value === 'string' && value.trim().length > 0).map((imageUrl, index) => ({ imageUrl: imageUrl.trim(), displayOrder: index, isPrimary: index === 0 })) : [];

const buildPropertyData = (body: Record<string, unknown>) => ({
  title: String(body.title || '').trim(), description: optionalString(body.description), categoryId: optionalString(body.categoryId), agentId: optionalString(body.agentId),
  propertyType: String(body.propertyType || 'RESIDENTIAL'), transactionType: String(body.transactionType || 'SALE'), price: optionalNumber(body.price), currency: optionalString(body.currency) || 'KES',
  location: optionalString(body.location), district: optionalString(body.district), sector: optionalString(body.sector), address: optionalString(body.address), bedrooms: optionalNumber(body.bedrooms), bathrooms: optionalNumber(body.bathrooms),
  size: optionalNumber(body.size), sizeUnit: optionalString(body.sizeUnit) || 'sqm', furnishingStatus: optionalString(body.furnishingStatus), status: String(body.status || 'AVAILABLE'), publicationStatus: String(body.publicationStatus || 'DRAFT'),
  isFeatured: Boolean(body.isFeatured), isNewDevelopment: Boolean(body.isNewDevelopment),
});

export const getAdminProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = { ...(typeof req.query.transactionType === 'string' ? { transactionType: req.query.transactionType } : {}), ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}), ...(typeof req.query.propertyType === 'string' ? { propertyType: req.query.propertyType } : {}), ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { location: { contains: search, mode: 'insensitive' as const } }] } : {}) };
    const [data, total] = await Promise.all([prisma.property.findMany({ where, include: propertyInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.property.count({ where })]);
    return res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { return next(error); }
};

export const getAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.findUnique({ where: { id: String(req.params.id) }, include: propertyInclude }); if (!property) return res.status(404).json({ success: false, message: 'Property not found.' }); return res.json({ success: true, data: property }); } catch (error) { return next(error); }
};

export const createAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>; const data = buildPropertyData(body); if (!data.title) return res.status(400).json({ success: false, message: 'A property title is required.' });
    const baseSlug = toSlug(typeof body.slug === 'string' && body.slug ? body.slug : data.title); if (!baseSlug) return res.status(400).json({ success: false, message: 'Please provide a valid property title.' });
    let slug = baseSlug; let suffix = 2; while (await prisma.property.findUnique({ where: { slug }, select: { id: true } })) slug = `${baseSlug}-${suffix++}`;
    const property = await prisma.property.create({ data: { ...data, slug, propertyImages: { create: imageData(body.images) } }, include: propertyInclude }); return res.status(201).json({ success: true, data: property });
  } catch (error) { return next(error); }
};

const saveProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>; const existing = await prisma.property.findUnique({ where: { id: String(req.params.id) } }); if (!existing) return res.status(404).json({ success: false, message: 'Property not found.' });
    const data = buildPropertyData({ ...existing, ...body }); if (!data.title) return res.status(400).json({ success: false, message: 'A property title is required.' });
    const property = await prisma.property.update({ where: { id: existing.id }, data: { ...data, ...(Array.isArray(body.images) ? { propertyImages: { deleteMany: {}, create: imageData(body.images) } } : {}) }, include: propertyInclude }); return res.json({ success: true, data: property });
  } catch (error) { return next(error); }
};

export const replaceAdminProperty = saveProperty;
export const updateAdminProperty = saveProperty;
export const deleteAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const property = await prisma.property.update({ where: { id: String(req.params.id) }, data: { status: 'ARCHIVED', publicationStatus: 'ARCHIVED' }, include: propertyInclude }); return res.json({ success: true, data: property, message: 'Property archived.' }); } catch (error) { return next(error); }
};
