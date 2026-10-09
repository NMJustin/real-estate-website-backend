import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createViewing,
  deleteViewing,
  getViewingById,
  getViewings,
  replaceViewing,
  updateViewing,
} from '../controllers/viewingController.js';

const router = Router();

router.post('/', createViewing);
router.get('/', requireAuth, authorize('admin'), getViewings);
router.get('/:id', requireAuth, authorize('admin'), getViewingById);
router.put('/:id', requireAuth, authorize('admin'), replaceViewing);
router.patch('/:id', requireAuth, authorize('admin'), updateViewing);
router.delete('/:id', requireAuth, authorize('admin'), deleteViewing);

export default router;
