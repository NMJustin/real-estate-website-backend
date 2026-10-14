import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { PropertyCategory } from '../entities/PropertyCategory.js';
import { Property } from '../entities/Property.js';
import { ArticleCategory } from '../entities/ArticleCategory.js';
import {
  getArticleCategories,
  createArticleCategory,
  updateArticleCategory as updateArticleCat,
  deleteArticleCategory as deleteArticleCat,
} from './articleCategoryController.js';

export const getCategories = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const type = typeof req.query.type === 'string' ? req.query.type.toLowerCase() : undefined;

    if (type === 'article') {
      return getArticleCategories(req, res, next);
    }

    const propCategoryRepo = AppDataSource.getRepository(PropertyCategory);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    if (type === 'all') {
      // Fetch both property categories and article categories
      const articleCategoryRepo = AppDataSource.getRepository(ArticleCategory);

      const [propRaw, articleRaw] = await Promise.all([
        propCategoryRepo
          .createQueryBuilder('category')
          .leftJoin('category.properties', 'property')
          .addSelect('COUNT(property.id)', 'propertyCount')
          .where('category.isActive = :isActive', { isActive: true })
          .groupBy('category.id')
          .orderBy('category.name', 'ASC')
          .getRawAndEntities(),
        articleCategoryRepo
          .createQueryBuilder('category')
          .leftJoin('category.articles', 'article')
          .addSelect('COUNT(article.id)', 'articleCount')
          .where('category.isActive = :isActive', { isActive: true })
          .groupBy('category.id')
          .orderBy('category.name', 'ASC')
          .getRawAndEntities(),
      ]);

      const propCategories = propRaw.entities.map((cat, idx) => ({
        ...cat,
        type: 'property',
        _count: { properties: Number(propRaw.raw[idx]?.propertyCount ?? 0) },
      }));

      const articleCategories = articleRaw.entities.map((cat, idx) => ({
        ...cat,
        type: 'article',
        _count: { articles: Number(articleRaw.raw[idx]?.articleCount ?? 0) },
      }));

      let allCategories = [...propCategories, ...articleCategories];
      if (search) {
        const lowerSearch = search.toLowerCase();
        allCategories = allCategories.filter(
          (c) => c.name.toLowerCase().includes(lowerSearch) || c.slug.toLowerCase().includes(lowerSearch),
        );
      }
      allCategories.sort((a, b) => a.name.localeCompare(b.name));

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const total = allCategories.length;
      const pagedData = allCategories.slice((page - 1) * limit, page * limit);

      return res.json({
        success: true,
        data: pagedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    // Default / type === 'property'
    const qb = propCategoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.properties', 'property')
      .addSelect('COUNT(property.id)', 'propertyCount')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('category.name', 'ASC');

    if (search) {
      qb.andWhere('(LOWER(category.name) LIKE LOWER(:search) OR LOWER(category.slug) LIKE LOWER(:search))', {
        search: `%${search}%`,
      });
    }

    const { entities: categories, raw } = await qb.getRawAndEntities();

    const categoriesWithCount = categories.map((category, index) => ({
      ...category,
      type: 'property',
      _count: { properties: Number(raw[index]?.propertyCount ?? 0) },
    }));

    if (req.query.page || req.query.limit) {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const total = categoriesWithCount.length;
      const paged = categoriesWithCount.slice((page - 1) * limit, page * limit);
      return res.json({
        success: true,
        data: paged,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    return res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    if (req.body.type === 'article') {
      return createArticleCategory(req, res, next);
    }
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const id = req.body.id || randomUUID();
    const category = categoryRepo.create({
      id,
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description ?? null,
      imageUrl: req.body.imageUrl ?? null,
      isActive: req.body.isActive ?? true,
    });
    const savedCategory = await categoryRepo.save(category);
    res.status(201).json({ success: true, data: { ...savedCategory, type: 'property' } });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({
      where: { slug: String(req.params.slug) },
      relations: { properties: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, data: { ...category, type: 'property' } });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = String(req.params.id);
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const propertyRepo = AppDataSource.getRepository(Property);
    const category = await categoryRepo.findOne({ where: { id } });

    if (category) {
      const count = await propertyRepo.count({ where: { categoryId: category.id } });
      return res.json({
        success: true,
        data: { ...category, type: 'property', _count: { properties: count } },
      });
    }

    // Check ArticleCategory fallback
    const articleCategoryRepo = AppDataSource.getRepository(ArticleCategory);
    const articleCategory = await articleCategoryRepo.findOne({
      where: { id },
      relations: { articles: true },
    });

    if (articleCategory) {
      return res.json({
        success: true,
        data: {
          ...articleCategory,
          type: 'article',
          _count: { articles: articleCategory.articles?.length ?? 0 },
        },
      });
    }

    return res.status(404).json({ success: false, message: 'Category not found' });
  } catch (error) {
    return next(error);
  }
};

export const replaceCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = String(req.params.id);
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id } });
    if (category) {
      Object.assign(category, req.body);
      const updatedCategory = await categoryRepo.save(category);
      return res.json({ success: true, data: { ...updatedCategory, type: 'property' } });
    }

    const articleCategoryRepo = AppDataSource.getRepository(ArticleCategory);
    const articleCat = await articleCategoryRepo.findOne({ where: { id } });
    if (articleCat) {
      Object.assign(articleCat, req.body);
      const updated = await articleCategoryRepo.save(articleCat);
      return res.json({ success: true, data: { ...updated, type: 'article' } });
    }

    return res.status(404).json({ success: false, message: 'Category not found' });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = String(req.params.id);
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id } });
    if (category) {
      if (req.body.name !== undefined) category.name = req.body.name;
      if (req.body.slug !== undefined) category.slug = req.body.slug;
      if (req.body.description !== undefined) category.description = req.body.description;
      if (req.body.imageUrl !== undefined) category.imageUrl = req.body.imageUrl;
      if (req.body.isActive !== undefined) category.isActive = req.body.isActive;
      const updatedCategory = await categoryRepo.save(category);
      return res.json({ success: true, data: { ...updatedCategory, type: 'property' } });
    }

    return updateArticleCat(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const id = String(req.params.id);
    const categoryRepo = AppDataSource.getRepository(PropertyCategory);
    const category = await categoryRepo.findOne({ where: { id } });
    if (category) {
      category.isActive = false;
      await categoryRepo.save(category);
      return res.status(204).send();
    }

    return deleteArticleCat(req, res, next);
  } catch (error) {
    next(error);
  }
};
