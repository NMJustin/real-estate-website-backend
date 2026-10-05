import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Agent } from '../entities/Agent.js';
import { Property } from '../entities/Property.js';
import { PropertyImage } from '../entities/PropertyImage.js';

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
      propertyImages: p.propertyImages ? p.propertyImages.filter(img => img.isPrimary).slice(0, 1) : [],
    }));

    res.json({ success: true, data: filteredProperties });
  } catch (error) {
    next(error);
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
    next(error);
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

    Object.assign(property, req.body);
    const updatedProperty = await propertyRepo.save(property);

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
    next(error);
  }
};
