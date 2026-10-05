import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Article } from '../entities/Article.js';
import { ArticleCategory } from '../entities/ArticleCategory.js';

export const getArticles = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const categoryRepo = AppDataSource.getRepository(ArticleCategory);

    const qb = articleRepo.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.publishedAt', 'DESC');

    if (typeof req.query.category === 'string') {
      const category = await categoryRepo.findOne({ where: { slug: req.query.category } });
      if (category) {
        qb.andWhere('article.categoryId = :categoryId', { categoryId: category.id });
      }
    }

    if (typeof req.query.status === 'string') {
      qb.andWhere('article.publicationStatus = :status', { status: req.query.status });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    qb.skip((page - 1) * limit).take(limit);

    const [articles, total] = await qb.getManyAndCount();

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) { next(error); }
};

export const getArticleBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = await articleRepo.findOne({
      where: { slug: String(req.params.slug) },
      relations: { category: true, author: true },
    });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    return res.json({ success: true, data: article });
  } catch (error) { return next(error); }
};

export const getArticleById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = await articleRepo.findOne({
      where: { id: String(req.params.id) },
      relations: { category: true, author: true },
    });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    return res.json({ success: true, data: article });
  } catch (error) { return next(error); }
};

export const createArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = articleRepo.create(req.body);
    const savedArticle = await articleRepo.save(article);
    res.status(201).json({ success: true, data: savedArticle });
  } catch (error) { next(error); }
};

export const replaceArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = await articleRepo.findOne({ where: { id: String(req.params.id) } });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(article, req.body);
    const updatedArticle = await articleRepo.save(article);
    res.json({ success: true, data: updatedArticle });
  } catch (error) { next(error); }
};

export const updateArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = await articleRepo.findOne({ where: { id: String(req.params.id) } });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    Object.assign(article, req.body);
    const updatedArticle = await articleRepo.save(article);
    res.json({ success: true, data: updatedArticle });
  } catch (error) { next(error); }
};

export const deleteArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const articleRepo = AppDataSource.getRepository(Article);
    const article = await articleRepo.findOne({ where: { id: String(req.params.id) } });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    await articleRepo.remove(article);
    res.status(204).send();
  } catch (error) { next(error); }
};
