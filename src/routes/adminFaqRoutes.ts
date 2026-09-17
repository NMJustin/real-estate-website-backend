import { Router } from 'express';
import { createFaq, deleteFaq, getFaqs, replaceFaq, updateFaq } from '../controllers/faqController.js';

const router = Router();

router.get('/', getFaqs);
router.post('/', createFaq);
router.put('/:id', replaceFaq);
router.patch('/:id', updateFaq);
router.delete('/:id', deleteFaq);

export default router;
