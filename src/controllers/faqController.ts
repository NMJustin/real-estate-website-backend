import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getFaqs = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try { const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }); res.json({ success: true, data: faqs }); } catch (error) { next(error); }
};

export const createFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const faq = await prisma.faq.create({ data: req.body }); res.status(201).json({ success: true, data: faq }); } catch (error) { next(error); }
};

export const replaceFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const faq = await prisma.faq.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: faq }); } catch (error) { next(error); }
};

export const updateFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { const faq = await prisma.faq.update({ where: { id: String(req.params.id) }, data: req.body }); res.json({ success: true, data: faq }); } catch (error) { next(error); }
};

export const deleteFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try { await prisma.faq.delete({ where: { id: String(req.params.id) } }); res.status(204).send(); } catch (error) { next(error); }
};
