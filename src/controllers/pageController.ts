import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { SitePage } from '../entities/SitePage.js';

export const getPages = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const pages = await pageRepo.find({ order: { createdAt: 'DESC' } });
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
};

export const getPageBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const page = await pageRepo.findOne({ where: { slug } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const getPageById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = await pageRepo.findOne({ where: { id } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const createPage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const page = pageRepo.create(req.body);
    const savedPage = await pageRepo.save(page);
    res.status(201).json({ success: true, data: savedPage });
  } catch (error) {
    next(error);
  }
};

export const replacePage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = await pageRepo.findOne({ where: { id } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    Object.assign(page, req.body);
    const updatedPage = await pageRepo.save(page);
    res.json({ success: true, data: updatedPage });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = await pageRepo.findOne({ where: { id } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    Object.assign(page, req.body);
    const updatedPage = await pageRepo.save(page);
    res.json({ success: true, data: updatedPage });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const pageRepo = AppDataSource.getRepository(SitePage);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = await pageRepo.findOne({ where: { id } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await pageRepo.remove(page);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
