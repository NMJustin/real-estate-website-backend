import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { PropertyImage } from '../entities/PropertyImage.js';

export const getPropertyImages = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const { propertyId } = req.query;
    const where = propertyId ? { propertyId: String(propertyId) } : {};
    const images = await propertyImageRepo.find({
      where,
      relations: { property: true },
      order: { displayOrder: 'ASC' },
    });

    // Filter property to only select specific fields
    const filteredImages = images.map(img => ({
      ...img,
      property: img.property ? { id: img.property.id, title: img.property.title, slug: img.property.slug } : null,
    }));

    res.json({ success: true, data: filteredImages });
  } catch (error) {
    next(error);
  }
};

export const getPropertyImageById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await propertyImageRepo.findOne({
      where: { id },
      relations: { property: true },
    });
    if (!image) return res.status(404).json({ success: false, message: 'Property image not found' });

    // Filter property to only select specific fields
    const filteredImage = {
      ...image,
      property: image.property ? { id: image.property.id, title: image.property.title, slug: image.property.slug } : null,
    };

    res.json({ success: true, data: filteredImage });
  } catch (error) {
    next(error);
  }
};

export const createPropertyImage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const image = propertyImageRepo.create(req.body);
    const savedImage = await propertyImageRepo.save(image);
    res.status(201).json({ success: true, data: savedImage });
  } catch (error) {
    next(error);
  }
};

export const replacePropertyImage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await propertyImageRepo.findOne({ where: { id } });
    if (!image) return res.status(404).json({ success: false, message: 'Property image not found' });
    Object.assign(image, req.body);
    const updatedImage = await propertyImageRepo.save(image);
    res.json({ success: true, data: updatedImage });
  } catch (error) {
    next(error);
  }
};

export const updatePropertyImage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await propertyImageRepo.findOne({ where: { id } });
    if (!image) return res.status(404).json({ success: false, message: 'Property image not found' });
    Object.assign(image, req.body);
    const updatedImage = await propertyImageRepo.save(image);
    res.json({ success: true, data: updatedImage });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyImage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await propertyImageRepo.findOne({ where: { id } });
    if (!image) return res.status(404).json({ success: false, message: 'Property image not found' });
    await propertyImageRepo.remove(image);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const setPrimaryImage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await propertyImageRepo.findOne({ where: { id } });
    if (!image) return res.status(404).json({ success: false, message: 'Property image not found' });

    // Use QueryRunner for transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(PropertyImage, { propertyId: image.propertyId }, { isPrimary: false });
      await queryRunner.manager.update(PropertyImage, { id }, { isPrimary: true });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    const updatedImage = await propertyImageRepo.findOne({ where: { id } });
    res.json({ success: true, data: updatedImage });
  } catch (error) {
    next(error);
  }
};
