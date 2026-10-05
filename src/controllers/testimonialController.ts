import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Testimonial } from '../entities/Testimonial.js';

export const getTestimonials = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const isActiveFilter = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const where: any = {};
    if (isActiveFilter !== undefined) where.isActive = isActiveFilter;

    const [testimonials, total] = await testimonialRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: testimonials,
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

export const getTestimonialById = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = await testimonialRepo.findOne({ where: { id: String(req.params.id) } });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    return res.json({ success: true, data: testimonial });
  } catch (error) {
    return next(error);
  }
};

export const createTestimonial = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = testimonialRepo.create(req.body);
    const savedTestimonial = await testimonialRepo.save(testimonial);
    res.status(201).json({ success: true, data: savedTestimonial });
  } catch (error) {
    next(error);
  }
};

export const replaceTestimonial = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = await testimonialRepo.findOne({ where: { id: String(req.params.id) } });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    Object.assign(testimonial, req.body);
    const updatedTestimonial = await testimonialRepo.save(testimonial);
    res.json({ success: true, data: updatedTestimonial });
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = await testimonialRepo.findOne({ where: { id: String(req.params.id) } });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    Object.assign(testimonial, req.body);
    const updatedTestimonial = await testimonialRepo.save(testimonial);
    res.json({ success: true, data: updatedTestimonial });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = await testimonialRepo.findOne({ where: { id: String(req.params.id) } });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    await testimonialRepo.remove(testimonial);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
