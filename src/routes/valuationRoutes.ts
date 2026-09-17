import { Router } from 'express';
import { createValuation, getValuationById, updateValuation } from '../controllers/valuationController.js';

const router = Router();

router.post('/', createValuation);
router.get('/:id', getValuationById);
router.patch('/:id', updateValuation);

export default router;
