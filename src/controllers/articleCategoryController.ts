import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { ArticleCategory } from '../entities/ArticleCategory.js';

export const getArticleCategories = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const qb = categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.articles', 'article')
      .addSelect('COUNT(article.id)', 'articleCount')
      .groupBy('category.id')
      .orderBy('category.name', 'ASC');

    if (search) {
      qb.where('LOWER(category.name) LIKE LOWER(:search) OR LOWER(category.slug) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (req.query.isActive !== undefined) {
      const isActive = req.query.isActive === 'true';
      qb.andWhere('category.isActive = :isActive', { isActive });
    }

    const { entities: categories, raw } = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const total = await categoryRepo.count(
      search
        ? {
            where: [
              { name: search },
              { slug: search },
            ],
          }
        : {},
    );

    const categoriesWithCount = categories.map((category, index) => ({
      ...category,
      type: 'article',
      _count: { articles: Number(raw[index]?.articleCount ?? 0) },
    }));

    res.json({
      success: true,
      data: categoriesWithCount,
      pagination: {
        page,
        limit,
        total: Math.max(total, categories.length),
        totalPages: Math.max(1, Math.ceil(Math.max(total, categories.length) / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategoryBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepo.findOne({
      where: { slug: String(req.params.slug) },
      relations: { articles: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Article category not found' });
    return res.json({ success: true, data: { ...category, type: 'article' } });
  } catch (error) {
    return next(error);
  }
};

export const getArticleCategoryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { articles: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Article category not found' });
    return res.json({
      success: true,
      data: {
        ...category,
        type: 'article',
        _count: { articles: category.articles?.length ?? 0 },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createArticleCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const id = req.body.id || randomUUID();
    const category = categoryRepo.create({
      id,
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description ?? null,
      imageUrl: req.body.imageUrl ?? null,
      isActive: req.body.isActive ?? true,
    });
    const saved = await categoryRepo.save(category);
    res.status(201).json({ success: true, data: { ...saved, type: 'article' } });
  } catch (error) {
    next(error);
  }
};

export const replaceArticleCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Article category not found' });
    Object.assign(category, req.body);
    const updated = await categoryRepo.save(category);
    res.json({ success: true, data: { ...updated, type: 'article' } });
  } catch (error) {
    next(error);
  }
};

export const updateArticleCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Article category not found' });
    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.slug !== undefined) category.slug = req.body.slug;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.imageUrl !== undefined) category.imageUrl = req.body.imageUrl;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;
    const updated = await categoryRepo.save(category);
    res.json({ success: true, data: { ...updated, type: 'article' } });
  } catch (error) {
    next(error);
  }
};

export const deleteArticleCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!category) return res.status(404).json({ success: false, message: 'Article category not found' });
    category.isActive = false;
    await categoryRepo.save(category);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
