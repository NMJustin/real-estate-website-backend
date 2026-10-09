import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Inquiry } from '../entities/Inquiry.js';
import { Property } from '../entities/Property.js';

export const getInquiries = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const status = req.query.status as string | undefined;

    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const qb = inquiryRepo.createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.property', 'property')
      .select(['inquiry', 'property.title', 'property.slug'])
      .orderBy('inquiry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('inquiry.status = :status', { status });
    }

    const [inquiries, total] = await qb.getManyAndCount();

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = inquiryRepo.create({
      ...req.body,
      propertyId: req.body.propertyId ? String(req.body.propertyId) : undefined,
    });
    const savedInquiry = await inquiryRepo.save(inquiry);
    res.status(201).json({ success: true, data: savedInquiry });
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    return res.json({ success: true, data: inquiry });
  } catch (error) {
    return next(error);
  }
};

export const replaceInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    Object.assign(inquiry, req.body);
    const updatedInquiry = await inquiryRepo.save(inquiry);
    res.json({ success: true, data: updatedInquiry });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    const body = req.body as Record<string, unknown>;
    const allowedStatuses = new Set(['NEW', 'PENDING', 'READ', 'CONTACTED', 'INTERESTED', 'APPROVED', 'RESOLVED', 'CLOSED']);
    for (const field of ['name', 'email', 'phone', 'message'] as const) {
      if (field in body) {
        if (typeof body[field] !== 'string' || (field !== 'phone' && !body[field].trim())) {
          return res.status(400).json({ success: false, message: `Invalid ${field}.` });
        }
        const value = body[field].trim();
        if (field === 'phone') inquiry.phone = value || undefined;
        else inquiry[field] = value;
      }
    }
    if ('status' in body) {
      if (typeof body.status !== 'string' || !allowedStatuses.has(body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid inquiry status.' });
      }
      inquiry.status = body.status;
    }
    const updatedInquiry = await inquiryRepo.save(inquiry);
    res.json({ success: true, data: updatedInquiry });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const inquiry = await inquiryRepo.findOne({ where: { id: String(req.params.id) } });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    await inquiryRepo.remove(inquiry);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
