import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Property } from '../entities/Property.js';
import { PropertyCategory } from '../entities/PropertyCategory.js';
import { Agent } from '../entities/Agent.js';
import { Development } from '../entities/Development.js';
import { PropertyImage } from '../entities/PropertyImage.js';
import { PropertyFeatureLink } from '../entities/PropertyFeatureLink.js';
import { PropertyFeature } from '../entities/PropertyFeature.js';
import { Like, In, Between } from 'typeorm';

const numberQuery = (value: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const listQuery = (value: unknown) => {
  if (typeof value !== 'string') return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

export const getProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const query = req.query;
    const propertyRepo = AppDataSource.getRepository(Property);
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);

    const qb = propertyRepo.createQueryBuilder('property')
      .leftJoinAndSelect('property.category', 'category')
      .leftJoinAndSelect('property.agent', 'agent')
      .leftJoinAndSelect('property.development', 'development')
      .leftJoinAndSelect('property.propertyImages', 'propertyImages')
      .leftJoinAndSelect('property.propertyFeatures', 'propertyFeatures')
      .leftJoinAndSelect('propertyFeatures.feature', 'feature');

    qb.andWhere('property.publicationStatus = :publicationStatus', { publicationStatus: 'PUBLISHED' });

    if (typeof query.location === 'string') {
      qb.andWhere('LOWER(property.location) LIKE LOWER(:location)', { location: `%${query.location}%` });
    }
    if (typeof query.district === 'string') {
      qb.andWhere('LOWER(property.district) LIKE LOWER(:district)', { district: `%${query.district}%` });
    }
    if (typeof query.sector === 'string') {
      qb.andWhere('LOWER(property.sector) LIKE LOWER(:sector)', { sector: `%${query.sector}%` });
    }
    if (typeof query.propertyType === 'string') {
      qb.andWhere('property.propertyType = :propertyType', { propertyType: query.propertyType });
    }
    if (typeof query.transactionType === 'string') {
      const type = query.transactionType.toUpperCase();
      const transactionType = type === 'BUY' ? 'SALE' : type === 'RENT' ? 'RENT' : type;
      qb.andWhere('property.transactionType = :transactionType', { transactionType });
    }

    if (typeof query.priceRange === 'string') {
      const parts = query.priceRange.split('-');
      if (parts.length === 2) {
        query.minPrice = parts[0];
        query.maxPrice = parts[1];
      } else if (query.priceRange.endsWith('+')) {
        query.minPrice = query.priceRange.replace('+', '');
      }
    }

    if (typeof query.category === 'string') {
      const category = await categoryRepo.findOne({ where: { slug: query.category, isActive: true } });
      if (category) {
        qb.andWhere('property.categoryId = :categoryId', { categoryId: category.id });
      }
    }

    if (typeof query.status === 'string') {
      qb.andWhere('property.status = :status', { status: query.status });
    }
    if (typeof query.availability === 'string') {
      qb.andWhere('property.status = :status', { status: query.availability });
    }
    if (typeof query.furnishingStatus === 'string') {
      qb.andWhere('property.furnishingStatus = :furnishingStatus', { furnishingStatus: query.furnishingStatus });
    }
    if (query.featured === 'true') {
      qb.andWhere('property.isFeatured = :isFeatured', { isFeatured: true });
    }
    if (query.newDevelopment === 'true') {
      qb.andWhere('property.isNewDevelopment = :isNewDevelopment', { isNewDevelopment: true });
    }

    const minPrice = numberQuery(query.minPrice);
    const maxPrice = numberQuery(query.maxPrice);
    const minSize = numberQuery(query.minSize);
    const maxSize = numberQuery(query.maxSize);

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        qb.andWhere('property.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
      } else if (minPrice !== undefined) {
        qb.andWhere('property.price >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        qb.andWhere('property.price <= :maxPrice', { maxPrice });
      }
    }

    if (minSize !== undefined || maxSize !== undefined) {
      if (minSize !== undefined && maxSize !== undefined) {
        qb.andWhere('property.size BETWEEN :minSize AND :maxSize', { minSize, maxSize });
      } else if (minSize !== undefined) {
        qb.andWhere('property.size >= :minSize', { minSize });
      } else if (maxSize !== undefined) {
        qb.andWhere('property.size <= :maxSize', { maxSize });
      }
    }

    const bedrooms = numberQuery(query.bedrooms);
    const bathrooms = numberQuery(query.bathrooms);
    if (bedrooms !== undefined) {
      qb.andWhere('property.bedrooms >= :bedrooms', { bedrooms });
    }
    if (bathrooms !== undefined) {
      qb.andWhere('property.bathrooms >= :bathrooms', { bathrooms });
    }

    const minBedrooms = numberQuery(query.minBedrooms);
    const maxBedrooms = numberQuery(query.maxBedrooms);
    const minBathrooms = numberQuery(query.minBathrooms);
    const maxBathrooms = numberQuery(query.maxBathrooms);

    if (minBedrooms !== undefined || maxBedrooms !== undefined) {
      if (minBedrooms !== undefined && maxBedrooms !== undefined) {
        qb.andWhere('property.bedrooms BETWEEN :minBedrooms AND :maxBedrooms', { minBedrooms, maxBedrooms });
      } else if (minBedrooms !== undefined) {
        qb.andWhere('property.bedrooms >= :minBedrooms', { minBedrooms });
      } else if (maxBedrooms !== undefined) {
        qb.andWhere('property.bedrooms <= :maxBedrooms', { maxBedrooms });
      }
    }

    if (minBathrooms !== undefined || maxBathrooms !== undefined) {
      if (minBathrooms !== undefined && maxBathrooms !== undefined) {
        qb.andWhere('property.bathrooms BETWEEN :minBathrooms AND :maxBathrooms', { minBathrooms, maxBathrooms });
      } else if (minBathrooms !== undefined) {
        qb.andWhere('property.bathrooms >= :minBathrooms', { minBathrooms });
      } else if (maxBathrooms !== undefined) {
        qb.andWhere('property.bathrooms <= :maxBathrooms', { maxBathrooms });
      }
    }

    const features = listQuery(query.features);
    if (features.length) {
      qb.andWhere('property.amenities && :features', { features });
    }

    const page = Math.max(1, numberQuery(query.page) || 1);
    const limit = Math.min(100, Math.max(1, numberQuery(query.limit) || 20));

    qb.skip((page - 1) * limit).take(limit);

    if (typeof query.sort === 'string' && query.sort === 'price') {
      qb.orderBy('property.price', 'ASC');
    } else {
      qb.orderBy('property.createdAt', 'DESC');
    }

    const properties = await qb.getMany();

    res.json({ success: true, data: properties, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getPropertyBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const slug = String(req.params.slug);
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({
      where: { slug },
      relations: { category: true, agent: true, development: true, propertyImages: true, propertyFeatures: { feature: true } },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
};

export const getPropertiesByFilter = async (filter: string, req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const query = { ...req.query, ...(filter === 'for-sale' ? { transactionType: 'SALE' } : {}), ...(filter === 'for-rent' ? { transactionType: 'RENT' } : {}), ...(filter === 'for-lease' ? { transactionType: 'LEASE' } : {}), ...(filter === 'residential' ? { propertyType: 'RESIDENTIAL' } : {}), ...(filter === 'commercial' ? { propertyType: 'COMMERCIAL' } : {}), ...(filter === 'apartments' ? { propertyType: 'APARTMENTS' } : {}), ...(filter === 'houses' ? { propertyType: 'HOUSES' } : {}), ...(filter === 'land' ? { propertyType: 'LAND' } : {}), ...(filter === 'offices' ? { propertyType: 'OFFICES' } : {}), ...(filter === 'warehouses' ? { propertyType: 'WAREHOUSES' } : {}), ...(filter === 'new-developments' ? { newDevelopment: 'true' } : {}) };
    req.query = query;
    return getProperties(req, res, next);
  } catch (error) {
    return next(error);
  }
};

export const getForSaleProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('for-sale', req, res, next);
export const getForRentProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('for-rent', req, res, next);
export const getForLeaseProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('for-lease', req, res, next);
export const getResidentialProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('residential', req, res, next);
export const getCommercialProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('commercial', req, res, next);
export const getApartmentsProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('apartments', req, res, next);
export const getHousesProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('houses', req, res, next);
export const getLandProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('land', req, res, next);
export const getOfficesProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('offices', req, res, next);
export const getWarehousesProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('warehouses', req, res, next);
export const getNewDevelopmentProperties = (req: Request, res: Response, next: (error: unknown) => void) => getPropertiesByFilter('new-developments', req, res, next);

export const getPropertiesByCategory = (req: Request, res: Response, next: (error: unknown) => void) => {
  req.query.category = String(req.params.category);
  return getProperties(req, res, next);
};

export const createProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let propertyData = { ...req.body };

    // If user is an agent, automatically assign the property to their agent profile
    if (userRole === 'agent' && userId) {
      const agentRepo = AppDataSource.getRepository(Agent);
      const agent = await agentRepo.findOne({ where: { userId } });
      if (!agent) {
        return res.status(400).json({ success: false, message: 'Agent profile not found. Please contact admin to create your agent profile.' });
      }
      propertyData.agentId = agent.id;
    }

    const propertyRepo = AppDataSource.getRepository(Property);
    const property = propertyRepo.create(propertyData);
    const savedProperty = await propertyRepo.save(property);
    return res.status(201).json({ success: true, data: savedProperty });
  } catch (error: any) {
    console.error('Create property error:', error);

    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A property with this slug already exists. Please use a different slug.' });
    }

    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid foreign key reference. Check that agentId, categoryId, etc. are valid.' });
    }

    return res.status(500).json({ success: false, message: 'Failed to create property.', error: error.message });
  }
};

export const getPropertyById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { category: true, agent: true, development: true, propertyImages: true, propertyFeatures: { feature: true } },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.json({ success: true, data: property });
  } catch (error) {
    return next(error);
  }
};

export const replaceProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id: String(req.params.id) } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    Object.assign(property, req.body);
    const updatedProperty = await propertyRepo.save(property);
    return res.json({ success: true, data: updatedProperty });
  } catch (error) {
    return next(error);
  }
};

export const updateProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id: String(req.params.id) } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    Object.assign(property, req.body);
    const updatedProperty = await propertyRepo.save(property);
    return res.json({ success: true, data: updatedProperty });
  } catch (error) {
    return next(error);
  }
};

export const deleteProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id: String(req.params.id) } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    await propertyRepo.remove(property);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
