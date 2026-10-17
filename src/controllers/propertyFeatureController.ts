import type { Request, Response } from 'express';
import crypto from 'crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { PropertyFeature } from '../entities/PropertyFeature.js';

export const getAllFeatures = async (req: Request, res: Response) => {
  try {
    const featureRepo = AppDataSource.getRepository(PropertyFeature);
    const features = await featureRepo.find({ order: { name: 'ASC' } });
    res.json({ success: true, data: features });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch features' });
  }
};

export const getFeatureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const featureRepo = AppDataSource.getRepository(PropertyFeature);
    const feature = await featureRepo.findOne({ where: { id } });
    
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }
    
    res.json({ success: true, data: feature });
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch feature' });
  }
};

export const createFeature = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' });
    }
    
    const featureRepo = AppDataSource.getRepository(PropertyFeature);
    
    // Check if feature with same name or slug exists
    const existingFeature = await featureRepo.findOne({
      where: [{ name }, { slug }]
    });
    
    if (existingFeature) {
      return res.status(400).json({ success: false, message: 'Feature with this name or slug already exists' });
    }
    
    const feature = featureRepo.create({ id: crypto.randomUUID(), name, slug });
    await featureRepo.save(feature);
    
    res.status(201).json({ success: true, data: feature });
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ success: false, message: 'Unable to create feature' });
  }
};

export const updateFeature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    
    const featureRepo = AppDataSource.getRepository(PropertyFeature);
    const feature = await featureRepo.findOne({ where: { id } });
    
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }
    
    if (name) feature.name = name;
    if (slug) feature.slug = slug;
    
    await featureRepo.save(feature);
    
    res.json({ success: true, data: feature });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ success: false, message: 'Unable to update feature' });
  }
};

export const deleteFeature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const featureRepo = AppDataSource.getRepository(PropertyFeature);
    const feature = await featureRepo.findOne({ where: { id } });
    
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }
    
    await featureRepo.remove(feature);
    
    res.json({ success: true, message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ success: false, message: 'Unable to delete feature' });
  }
};
