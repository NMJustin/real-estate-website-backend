import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Agent } from '../entities/Agent.js';
import { Property } from '../entities/Property.js';
import { PropertyImage } from '../entities/PropertyImage.js';

const editablePropertyFields = [
  'title', 'description', 'categoryId', 'propertyType', 'transactionType', 'price', 'currency',
  'location', 'district', 'sector', 'address', 'latitude', 'longitude', 'size', 'sizeUnit',
  'bedrooms', 'bathrooms', 'status', 'publicationStatus', 'isFeatured', 'isNewDevelopment',
  'furnishingStatus', 'amenities', 'area', 'locationDescription', 'nearbyLandmarks',
  'neighborhood', 'parking',
] as const;

const optionalTextFields = new Set([
  'description', 'categoryId', 'currency', 'location', 'district', 'sector', 'address',
  'sizeUnit', 'furnishingStatus', 'area', 'locationDescription', 'nearbyLandmarks', 'neighborhood',
]);

const numberFields = new Set(['price', 'latitude', 'longitude', 'size', 'bedrooms', 'bathrooms', 'parking']);
const allowedStatuses = new Set(['AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'LEASED', 'ARCHIVED']);
const allowedPublicationStatuses = new Set(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

const validatePropertyChanges = (body: Record<string, unknown>) => {
  const changes: Record<string, unknown> = {};
  for (const field of editablePropertyFields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (numberFields.has(field)) {
      if (value === '' || value === null) {
        changes[field] = undefined;
        continue;
      }
      const number = Number(value);
      if (!Number.isFinite(number) || (['bedrooms', 'bathrooms', 'parking'].includes(field) && !Number.isInteger(number))) {
        throw new Error(`Invalid value for ${field}.`);
      }
      changes[field] = number;
      continue;
    }
    if (field === 'isFeatured' || field === 'isNewDevelopment') {
      if (typeof value !== 'boolean') throw new Error(`Invalid value for ${field}.`);
      changes[field] = value;
      continue;
    }
    if (field === 'amenities') {
      if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
        throw new Error('Amenities must be a list of text values.');
      }
      changes[field] = value.map((item) => item.trim()).filter(Boolean);
      continue;
    }
    if (typeof value !== 'string') throw new Error(`Invalid value for ${field}.`);
    const normalized = value.trim();
    if (field === 'title' && !normalized) throw new Error('Property title is required.');
    if (field === 'status' && !allowedStatuses.has(normalized)) throw new Error('Invalid property status.');
    if (field === 'publicationStatus' && !allowedPublicationStatuses.has(normalized)) throw new Error('Invalid publication status.');
    changes[field] = optionalTextFields.has(field) && !normalized ? undefined : normalized;
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images) || !body.images.every((item) => typeof item === 'string' || (typeof item === 'object' && item !== null && 'url' in item))) {
      throw new Error('Images must be an array of media URLs.');
    }
    changes.images = body.images.map((item) => {
      if (typeof item === 'string') return { imageUrl: item.trim(), mediaType: 'IMAGE' };
      const media = item as { url: unknown; mediaType?: unknown };
      if (typeof media.url !== 'string' || !media.url.trim()) throw new Error('Every image must include a URL.');
      return { imageUrl: media.url.trim(), mediaType: media.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE' };
    });
  }
  return changes;
};

export const getAgentProperties = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const propertyRepo = AppDataSource.getRepository(Property);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const properties = await propertyRepo.find({
      where: { agentId: agent.id },
      relations: { category: true, propertyImages: true },
      order: { createdAt: 'DESC' },
    });

    // Filter propertyImages to only get primary image and filter category fields
    const filteredProperties = properties.map(p => ({
      ...p,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      propertyImages: p.propertyImages ? p.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
    }));

    res.json({ success: true, data: filteredProperties });
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties. Please try again later.' });
  }
};

export const getAgentProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const propertyRepo = AppDataSource.getRepository(Property);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const property = await propertyRepo.findOne({
      where: { id, agentId: agent.id },
      relations: { category: true, propertyImages: true },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or not assigned to you.' });
    }

    // Sort propertyImages by displayOrder and filter category fields
    const sortedProperty = {
      ...property,
      category: property.category ? { id: property.category.id, name: property.category.name, slug: property.category.slug } : null,
      propertyImages: property.propertyImages ? property.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
    };

    res.json({ success: true, data: sortedProperty });
  } catch (error) {
    console.error('Error fetching agent property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property. Please try again later.' });
  }
};

export const updateAgentProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const propertyRepo = AppDataSource.getRepository(Property);

    const agent = await agentRepo.findOne({ where: { userId } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Agent profile not found.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const property = await propertyRepo.findOne({
      where: { id, agentId: agent.id },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or not assigned to you.' });
    }

    const changes = validatePropertyChanges(req.body as Record<string, unknown>);
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let updatedProperty: Property;
    try {
      Object.assign(property, changes);
      updatedProperty = await queryRunner.manager.save(property);
      if (Array.isArray(changes.images)) {
        await queryRunner.manager.delete(PropertyImage, { propertyId: property.id });
        for (const [index, image] of changes.images.entries()) {
          await queryRunner.manager.save(queryRunner.manager.create(PropertyImage, {
            ...image,
            propertyId: property.id,
            displayOrder: index,
            isPrimary: index === 0,
          }));
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    const propertyWithRelations = await propertyRepo.findOne({
      where: { id: updatedProperty.id },
      relations: { category: true, propertyImages: true },
    });

    // Sort propertyImages by displayOrder and filter category fields
    const sortedProperty = propertyWithRelations ? {
      ...propertyWithRelations,
      category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name, slug: propertyWithRelations.category.slug } : null,
      propertyImages: propertyWithRelations.propertyImages ? propertyWithRelations.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder) : [],
    } : propertyWithRelations;

    res.json({ success: true, data: sortedProperty });
  } catch (error) {
    console.error('Error updating agent property:', error);
    if (error instanceof Error && /^(Invalid value|Property title|Invalid property|Amenities|Images|Every image)/.test(error.message)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to update property. Please try again later.' });
  }
};

export const archiveAgentProperty = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    const agent = await AppDataSource.getRepository(Agent).findOne({ where: { userId } });
    if (!agent) return res.status(403).json({ success: false, message: 'Agent profile not found.' });

    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id: String(req.params.id), agentId: agent.id } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found or not assigned to you.' });

    property.status = 'ARCHIVED';
    property.publicationStatus = 'ARCHIVED';
    await propertyRepo.save(property);
    return res.json({ success: true, message: 'Assigned property archived.' });
  } catch (error) {
    console.error('Error archiving agent property:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive property. Please try again later.' });
  }
};
