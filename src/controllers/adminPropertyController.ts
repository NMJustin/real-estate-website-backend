import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Property } from '../entities/Property.js';
import { PropertyImage } from '../entities/PropertyImage.js';
import { User } from '../entities/User.js';
import type { DeepPartial } from 'typeorm';

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const optionalString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const optionalNumber = (value: unknown) => value === '' || value === undefined || value === null || !Number.isFinite(Number(value)) ? undefined : Number(value);
const imageData = (images: unknown) => Array.isArray(images)
  ? images.map((value) => typeof value === 'string' ? { url: value, mediaType: 'IMAGE' } : value)
    .filter((value): value is { url: string; mediaType?: string } => typeof value === 'object' && value !== null && typeof value.url === 'string' && value.url.trim().length > 0)
    .map((value, index) => ({ imageUrl: value.url.trim(), mediaType: value.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE', displayOrder: index, isPrimary: index === 0 }))
  : [];

const buildPropertyData = (body: Record<string, unknown>) => ({
  title: String(body.title || '').trim(), description: optionalString(body.description) || undefined, categoryId: optionalString(body.categoryId), agentId: optionalString(body.agentId),
  propertyManagerId: body.propertyManagerId === null || body.propertyManagerId === '' ? null : optionalString(body.propertyManagerId),
  propertyType: String(body.propertyType || 'RESIDENTIAL'), transactionType: String(body.transactionType || 'SALE'), price: optionalNumber(body.price), currency: optionalString(body.currency) || 'RWF',
  location: optionalString(body.location), district: optionalString(body.district), sector: optionalString(body.sector), address: optionalString(body.address), neighborhood: optionalString(body.neighborhood), area: optionalString(body.area),
  nearbyLandmarks: optionalString(body.nearbyLandmarks), locationDescription: optionalString(body.locationDescription), latitude: optionalNumber(body.latitude), longitude: optionalNumber(body.longitude),
  bedrooms: optionalNumber(body.bedrooms), bathrooms: optionalNumber(body.bathrooms), parking: optionalNumber(body.parking),
  size: optionalNumber(body.size), sizeUnit: optionalString(body.sizeUnit) || 'sqm', furnishingStatus: optionalString(body.furnishingStatus), status: String(body.status || 'AVAILABLE'), publicationStatus: String(body.publicationStatus || 'DRAFT'),
  isFeatured: Boolean(body.isFeatured), isNewDevelopment: Boolean(body.isNewDevelopment),
  amenities: Array.isArray(body.amenities) ? body.amenities.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [],
});

export const getAdminProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const page = Math.max(1, Number(req.query.page) || 1);
    const isPropertyManager = req.user?.role?.toLowerCase() === 'property_manager';
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || (isPropertyManager ? 100 : 10)));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const qb = propertyRepo.createQueryBuilder('property')
      .leftJoinAndSelect('property.agent', 'agent')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.propertyImages', 'propertyImages')
      .orderBy(isPropertyManager ? 'property.updatedAt' : 'property.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (isPropertyManager) {
      qb.andWhere('property.propertyManagerId = :propertyManagerId', { propertyManagerId: req.user!.id });
    }
    if (typeof req.query.transactionType === 'string') {
      qb.andWhere('property.transactionType = :transactionType', { transactionType: req.query.transactionType });
    }
    if (typeof req.query.status === 'string') {
      qb.andWhere('property.status = :status', { status: req.query.status });
    }
    if (typeof req.query.propertyType === 'string') {
      qb.andWhere('property.propertyType = :propertyType', { propertyType: req.query.propertyType });
    }
    if (search) {
      qb.andWhere('(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.location) LIKE LOWER(:search))', { search: `%${search}%` });
    }

    qb.addOrderBy('propertyImages.displayOrder', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    // Filter to only select specific fields
    const filteredData = data.map(p => ({
      ...p,
      agent: p.agent ? { id: p.agent.id, name: p.agent.name } : null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
    }));

    const response: Record<string, unknown> = {
      success: true,
      data: filteredData,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
    if (isPropertyManager) {
      const statusRows = await propertyRepo.createQueryBuilder('property')
        .select('property.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('property.propertyManagerId = :propertyManagerId', { propertyManagerId: req.user!.id })
        .groupBy('property.status')
        .getRawMany<{ status: string; count: string }>();
      const publicationRows = await propertyRepo.createQueryBuilder('property')
        .select('property.publicationStatus', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('property.propertyManagerId = :propertyManagerId', { propertyManagerId: req.user!.id })
        .groupBy('property.publicationStatus')
        .getRawMany<{ status: string; count: string }>();
      response.stats = {
        availableProperties: Number(statusRows.find((row) => row.status === 'AVAILABLE')?.count || 0),
        statusCounts: Object.fromEntries(statusRows.map((row) => [row.status, Number(row.count)])),
        publicationStatusCounts: Object.fromEntries(publicationRows.map((row) => [row.status, Number(row.count)])),
      };
    }
    return res.json(response);
  } catch (error) { return next(error); }
};

export const getAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { agent: true, category: true, propertyImages: true },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    // Filter to only select specific fields
    const filteredProperty = {
      ...property,
      agent: property.agent ? { id: property.agent.id, name: property.agent.name } : null,
      category: property.category ? { id: property.category.id, name: property.category.name } : null,
      propertyImages: property.propertyImages ? property.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
    };

    return res.json({ success: true, data: filteredProperty });
  } catch (error) { return next(error); }
};

export const createAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>;
    const data = buildPropertyData(body);
    if (!data.title) return res.status(400).json({ success: false, message: 'A property title is required.' });
    if (data.propertyManagerId) {
      const manager = await AppDataSource.getRepository(User).findOne({
        where: { id: data.propertyManagerId, isActive: true },
        relations: { role: true },
      });
      if (manager?.role?.name.trim().toLowerCase() !== 'property_manager') {
        return res.status(400).json({ success: false, message: 'Select an active property manager.' });
      }
    }

    const baseSlug = toSlug(typeof body.slug === 'string' && body.slug ? body.slug : data.title);
    if (!baseSlug) return res.status(400).json({ success: false, message: 'Please provide a valid property title.' });

    const propertyRepo = AppDataSource.getRepository(Property);
    let slug = baseSlug;
    let suffix = 2;
    while (await propertyRepo.findOne({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const property = propertyRepo.create({ ...data, slug } as DeepPartial<Property>);
      const savedProperty = await queryRunner.manager.save(property);

      if (Array.isArray(body.images)) {
        const images = imageData(body.images);
        for (const img of images) {
          const propertyImage = queryRunner.manager.create(PropertyImage, {
            ...img,
            propertyId: savedProperty.id,
          });
          await queryRunner.manager.save(propertyImage);
        }
      }

      await queryRunner.commitTransaction();

      const propertyWithRelations = await propertyRepo.findOne({
        where: { id: savedProperty.id },
        relations: { agent: true, category: true, propertyImages: true },
      });

      // Filter to only select specific fields
      const filteredProperty = propertyWithRelations ? {
        ...propertyWithRelations,
        agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name } : null,
        category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name } : null,
        propertyImages: propertyWithRelations.propertyImages ? propertyWithRelations.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
      } : propertyWithRelations;

      return res.status(201).json({ success: true, data: filteredProperty });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) { return next(error); }
};

const saveProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const body = req.body as Record<string, unknown>;
    const propertyRepo = AppDataSource.getRepository(Property);
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);

    const existing = await propertyRepo.findOne({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found.' });

    const data = buildPropertyData({ ...existing, ...body });
    if (!data.title) return res.status(400).json({ success: false, message: 'A property title is required.' });
    if ('propertyManagerId' in body && data.propertyManagerId) {
      const manager = await AppDataSource.getRepository(User).findOne({
        where: { id: data.propertyManagerId, isActive: true },
        relations: { role: true },
      });
      if (manager?.role?.name.trim().toLowerCase() !== 'property_manager') {
        return res.status(400).json({ success: false, message: 'Select an active property manager.' });
      }
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      Object.assign(existing, data);
      const savedProperty = await queryRunner.manager.save(existing);

      if (Array.isArray(body.images)) {
        // Delete existing images
        await queryRunner.manager.delete(PropertyImage, { propertyId: existing.id });

        // Create new images
        const images = imageData(body.images);
        for (const img of images) {
          const propertyImage = queryRunner.manager.create(PropertyImage, {
            ...img,
            propertyId: savedProperty.id,
          });
          await queryRunner.manager.save(propertyImage);
        }
      }

      await queryRunner.commitTransaction();

      const propertyWithRelations = await propertyRepo.findOne({
        where: { id: savedProperty.id },
        relations: { agent: true, category: true, propertyImages: true },
      });

      // Filter to only select specific fields
      const filteredProperty = propertyWithRelations ? {
        ...propertyWithRelations,
        agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name } : null,
        category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name } : null,
        propertyImages: propertyWithRelations.propertyImages ? propertyWithRelations.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
      } : propertyWithRelations;

      return res.json({ success: true, data: filteredProperty });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) { return next(error); }
};

export const replaceAdminProperty = saveProperty;
export const updateAdminProperty = saveProperty;
export const deleteAdminProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id: String(req.params.id) } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    property.status = 'ARCHIVED';
    property.publicationStatus = 'ARCHIVED';
    const savedProperty = await propertyRepo.save(property);

    const propertyWithRelations = await propertyRepo.findOne({
      where: { id: savedProperty.id },
      relations: { agent: true, category: true, propertyImages: true },
    });

    // Filter to only select specific fields
    const filteredProperty = propertyWithRelations ? {
      ...propertyWithRelations,
      agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name } : null,
      category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name } : null,
      propertyImages: propertyWithRelations.propertyImages ? propertyWithRelations.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
    } : propertyWithRelations;

    return res.json({ success: true, data: filteredProperty, message: 'Property archived.' });
  } catch (error) { return next(error); }
};
