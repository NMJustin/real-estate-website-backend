import { Router } from 'express';
import { getValuations } from '../controllers/valuationController.js';

const router = Router();

router.get('/', getValuations);

export default router;
