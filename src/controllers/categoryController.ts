import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { PropertyCategory } from '../entities/PropertyCategory.js';
import { Property } from '../entities/Property.js';

export const getCategories = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const { entities: categories, raw } = await categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.properties', 'property')
      .addSelect('COUNT(property.id)', 'propertyCount')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('category.name', 'ASC')
      .getRawAndEntities();

    const categoriesWithCount = categories.map((category, index) => ({
      ...category,
      _count: { properties: Number(raw[index]?.propertyCount ?? 0) },
    }));

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = categoryRepo.create(req.body);
    const savedCategory = await categoryRepo.save(category);
    res.status(201).json({ success: true, data: savedCategory });
  } catch (error) { next(error); }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({
      where: { slug: String(req.params.slug) },
      relations: { properties: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, data: category });
  } catch (error) { return next(error); }
};

export const getCategoryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const propertyRepo = AppDataSource.getRepository(Property);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const count = await propertyRepo.count({ where: { categoryId: category.id } });
    const categoryWithCount = { ...category, _count: { properties: count } };

    return res.json({ success: true, data: categoryWithCount });
  } catch (error) { return next(error); }
};

export const replaceCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    Object.assign(category, req.body);
    const updatedCategory = await categoryRepo.save(category);
    res.json({ success: true, data: updatedCategory });
  } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    Object.assign(category, req.body);
    const updatedCategory = await categoryRepo.save(category);
    res.json({ success: true, data: updatedCategory });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    category.isActive = false;
    await categoryRepo.save(category);
    res.status(204).send();
  } catch (error) { next(error); }
};
