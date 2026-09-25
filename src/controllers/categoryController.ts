import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getCategories = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try { 
    const categories = await prisma.propertyCategory.findMany({ 
      where: { isActive: true }, 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { properties: true }
        }
      }
    }); 
    res.json({ success: true, data: categories }); 
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const category = await prisma.propertyCategory.create({ data: req.body }); res.status(201).json({ success: true, data: category }); } catch (error) { next(error); }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const category = await prisma.propertyCategory.findUnique({ where: { slug: String(req.params.slug) }, include: { properties: true } }); if (!category) return res.status(404).json({ success: false, message: 'Category not found' }); return res.json({ success: true, data: category }); } catch (error) { return next(error); }
};

export const replaceCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const category = await prisma.propertyCategory.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: category }); } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const category = await prisma.propertyCategory.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: category }); } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { await prisma.propertyCategory.update({ where: { id: String(req.params.id) }, data: { isActive: false } }); res.status(204).send(); } catch (error) { next(error); }
};
