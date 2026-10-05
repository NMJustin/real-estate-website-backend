import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Property } from '../entities/Property.js';

export const getFeaturedProperties = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyRepo = AppDataSource.getRepository(Property);
    const properties = await propertyRepo.find({
      where: { isFeatured: true },
      relations: { category: true, agent: true, propertyImages: true },
      order: { createdAt: 'DESC' },
    });

    // Filter relations and propertyImages to only get primary image
    const filteredProperties = properties.map(p => ({
      ...p,
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      agent: p.agent ? { id: p.agent.id, name: p.agent.name, slug: p.agent.slug, profileImage: p.agent.profileImage } : null,
      propertyImages: p.propertyImages.filter(img => img.isPrimary).slice(0, 1),
    }));

    res.json({ success: true, data: filteredProperties });
  } catch (error) {
    next(error);
  }
};

export const setPropertyAsFeatured = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.isFeatured = true;
    const updatedProperty = await propertyRepo.save(property);

    const propertyWithRelations = await propertyRepo.findOne({
      where: { id: updatedProperty.id },
      relations: { category: true, agent: true },
    });

    // Filter relations
    const filteredProperty = propertyWithRelations ? {
      ...propertyWithRelations,
      category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name, slug: propertyWithRelations.category.slug } : null,
      agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name, slug: propertyWithRelations.agent.slug, profileImage: propertyWithRelations.agent.profileImage } : null,
    } : propertyWithRelations;

    res.json({ success: true, data: filteredProperty });
  } catch (error) {
    next(error);
  }
};

export const removePropertyFromFeatured = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.isFeatured = false;
    const updatedProperty = await propertyRepo.save(property);

    const propertyWithRelations = await propertyRepo.findOne({
      where: { id: updatedProperty.id },
      relations: { category: true, agent: true },
    });

    // Filter relations
    const filteredProperty = propertyWithRelations ? {
      ...propertyWithRelations,
      category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name, slug: propertyWithRelations.category.slug } : null,
      agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name, slug: propertyWithRelations.agent.slug, profileImage: propertyWithRelations.agent.profileImage } : null,
    } : propertyWithRelations;

    res.json({ success: true, data: filteredProperty });
  } catch (error) {
    next(error);
  }
};

export const toggleFeaturedStatus = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const propertyRepo = AppDataSource.getRepository(Property);
    const property = await propertyRepo.findOne({ where: { id } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.isFeatured = !property.isFeatured;
    const updatedProperty = await propertyRepo.save(property);

    const propertyWithRelations = await propertyRepo.findOne({
      where: { id: updatedProperty.id },
      relations: { category: true, agent: true },
    });

    // Filter relations
    const filteredProperty = propertyWithRelations ? {
      ...propertyWithRelations,
      category: propertyWithRelations.category ? { id: propertyWithRelations.category.id, name: propertyWithRelations.category.name, slug: propertyWithRelations.category.slug } : null,
      agent: propertyWithRelations.agent ? { id: propertyWithRelations.agent.id, name: propertyWithRelations.agent.name, slug: propertyWithRelations.agent.slug, profileImage: propertyWithRelations.agent.profileImage } : null,
    } : propertyWithRelations;

    res.json({ success: true, data: filteredProperty });
  } catch (error) {
    next(error);
  }
};
