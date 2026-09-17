import { Router } from 'express';
import { getServiceBySlug, getServices } from '../controllers/serviceController.js';

const router = Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

export default router;
