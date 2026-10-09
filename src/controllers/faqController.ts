import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Faq } from '../entities/Faq.js';

export const getFaqs = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faqs = await faqRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
    res.json({ success: true, data: faqs });
  } catch (error) { next(error); }
};

export const getManagedFaqs = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faqs = await faqRepo.find({ order: { displayOrder: 'ASC' } });
    res.json({ success: true, data: faqs });
  } catch (error) { next(error); }
};

export const getFaqById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faq = await faqRepo.findOne({ where: { id: String(req.params.id) } });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    return res.json({ success: true, data: faq });
  } catch (error) { return next(error); }
};

export const createFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faq = faqRepo.create(req.body);
    const savedFaq = await faqRepo.save(faq);
    res.status(201).json({ success: true, data: savedFaq });
  } catch (error) { next(error); }
};

export const replaceFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faq = await faqRepo.findOne({ where: { id: String(req.params.id) } });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    Object.assign(faq, req.body);
    const updatedFaq = await faqRepo.save(faq);
    res.json({ success: true, data: updatedFaq });
  } catch (error) { next(error); }
};

export const updateFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faq = await faqRepo.findOne({ where: { id: String(req.params.id) } });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    Object.assign(faq, req.body);
    const updatedFaq = await faqRepo.save(faq);
    res.json({ success: true, data: updatedFaq });
  } catch (error) { next(error); }
};

export const deleteFaq = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const faqRepo = AppDataSource.getRepository(Faq);
    const faq = await faqRepo.findOne({ where: { id: String(req.params.id) } });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    await faqRepo.remove(faq);
    res.status(204).send();
  } catch (error) { next(error); }
};
