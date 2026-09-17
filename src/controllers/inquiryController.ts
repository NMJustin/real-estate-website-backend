import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getInquiries = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
};

export const createInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiry = await prisma.inquiry.create({ data: { ...req.body, propertyId: req.body.propertyId ? String(req.body.propertyId) : undefined } });
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    return res.json({ success: true, data: inquiry });
  } catch (error) {
    return next(error);
  }
};

export const updateInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiry = await prisma.inquiry.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    await prisma.inquiry.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
