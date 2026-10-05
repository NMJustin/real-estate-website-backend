import { Router } from 'express';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonialById,
  getTestimonials,
  replaceTestimonial,
  updateTestimonial,
} from '../controllers/testimonialController.js';

const router = Router();

router.get('/', getTestimonials);
router.get('/:id', getTestimonialById);
router.post('/', createTestimonial);
router.put('/:id', replaceTestimonial);
router.patch('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

export default router;
