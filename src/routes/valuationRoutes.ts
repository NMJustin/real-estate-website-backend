import { Router } from 'express';
import {
  createValuation,
  deleteValuation,
  getValuationById,
  getValuations,
  replaceValuation,
  updateValuation,
} from '../controllers/valuationController.js';

const router = Router();

router.get('/', getValuations);
router.post('/', createValuation);
router.get('/:id', getValuationById);
router.put('/:id', replaceValuation);
router.patch('/:id', updateValuation);
router.delete('/:id', deleteValuation);

export default router;
