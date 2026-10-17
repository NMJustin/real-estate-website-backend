import type { Request, Response } from 'express';
import crypto from 'crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { Development } from '../entities/Development.js';

export const getAllDevelopments = async (req: Request, res: Response) => {
  try {
    const developmentRepo = AppDataSource.getRepository(Development);
    const developments = await developmentRepo.find({ order: { name: 'ASC' } });
    res.json({ success: true, data: developments });
  } catch (error) {
    console.error('Error fetching developments:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch developments' });
  }
};

export const getDevelopmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const developmentRepo = AppDataSource.getRepository(Development);
    const development = await developmentRepo.findOne({ where: { id } });
    
    if (!development) {
      return res.status(404).json({ success: false, message: 'Development not found' });
    }
    
    res.json({ success: true, data: development });
  } catch (error) {
    console.error('Error fetching development:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch development' });
  }
};

export const createDevelopment = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, location, developerName, status, completionDate, imageUrl } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' });
    }
    
    const developmentRepo = AppDataSource.getRepository(Development);
    
    // Check if development with same name or slug exists
    const existingDevelopment = await developmentRepo.findOne({
      where: [{ name }, { slug }]
    });
    
    if (existingDevelopment) {
      return res.status(400).json({ success: false, message: 'Development with this name or slug already exists' });
    }
    
    const development = developmentRepo.create({
      id: crypto.randomUUID(),
      name,
      slug,
      description: description || undefined,
      location: location || undefined,
      developerName: developerName || undefined,
      status: status || undefined,
      completionDate: completionDate ? new Date(completionDate) : undefined,
      imageUrl: imageUrl || undefined,
    });
    await developmentRepo.save(development);
    
    res.status(201).json({ success: true, data: development });
  } catch (error) {
    console.error('Error creating development:', error);
    res.status(500).json({ success: false, message: 'Unable to create development' });
  }
};

export const updateDevelopment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, location, developerName, status, completionDate, imageUrl } = req.body;
    
    const developmentRepo = AppDataSource.getRepository(Development);
    const development = await developmentRepo.findOne({ where: { id } });
    
    if (!development) {
      return res.status(404).json({ success: false, message: 'Development not found' });
    }
    
    if (name) development.name = name;
    if (slug) development.slug = slug;
    if (description !== undefined) development.description = description;
    if (location !== undefined) development.location = location;
    if (developerName !== undefined) development.developerName = developerName;
    if (status !== undefined) development.status = status;
    if (completionDate !== undefined) development.completionDate = completionDate ? new Date(completionDate) : undefined;
    if (imageUrl !== undefined) development.imageUrl = imageUrl;
    
    await developmentRepo.save(development);
    
    res.json({ success: true, data: development });
  } catch (error) {
    console.error('Error updating development:', error);
    res.status(500).json({ success: false, message: 'Unable to update development' });
  }
};

export const deleteDevelopment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const developmentRepo = AppDataSource.getRepository(Development);
    const development = await developmentRepo.findOne({ where: { id } });
    
    if (!development) {
      return res.status(404).json({ success: false, message: 'Development not found' });
    }
    
    await developmentRepo.remove(development);
    
    res.json({ success: true, message: 'Development deleted successfully' });
  } catch (error) {
    console.error('Error deleting development:', error);
    res.status(500).json({ success: false, message: 'Unable to delete development' });
  }
};
