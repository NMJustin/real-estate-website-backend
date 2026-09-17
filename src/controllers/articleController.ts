import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

export const getArticles = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const where: Prisma.ArticleWhereInput = {};
    if (typeof req.query.category === 'string') where.category = { slug: req.query.category };
    const articles = await prisma.article.findMany({ where, include: { category: true, author: true }, orderBy: { publishedAt: 'desc' } });
    res.json({ success: true, data: articles });
  } catch (error) { next(error); }
};

export const getArticleBySlug = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const article = await prisma.article.findUnique({ where: { slug: String(req.params.slug) }, include: { category: true, author: true } }); if (!article) return res.status(404).json({ success: false, message: 'Article not found' }); return res.json({ success: true, data: article }); } catch (error) { return next(error); }
};

export const createArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const article = await prisma.article.create({ data: req.body }); res.status(201).json({ success: true, data: article }); } catch (error) { next(error); }
};

export const replaceArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const article = await prisma.article.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: article }); } catch (error) { next(error); }
};

export const updateArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const article = await prisma.article.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: article }); } catch (error) { next(error); }
};

export const deleteArticle = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { await prisma.article.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); } catch (error) { next(error); }
};
