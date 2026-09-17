import { Router } from 'express';
import { createTestimonial, getTestimonials } from '../controllers/testimonialController.js';

const router = Router();

router.get('/', getTestimonials);
router.post('/', createTestimonial);

export default router;
