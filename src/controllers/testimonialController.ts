import type { Request, Response } from 'express';

export const getTestimonials = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Get testimonials route placeholder' });
};

export const createTestimonial = (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Create testimonial route placeholder' });
};
