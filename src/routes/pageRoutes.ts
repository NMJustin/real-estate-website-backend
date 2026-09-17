import { Router } from 'express';
import { getPageBySlug, getPages } from '../controllers/pageController.js';

const router = Router();

router.get('/', getPages);
router.get('/:slug', getPageBySlug);

export default router;
