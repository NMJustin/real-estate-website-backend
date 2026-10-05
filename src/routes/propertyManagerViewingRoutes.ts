import { Router } from 'express';
import {
  deleteViewing,
  getViewingById,
  getViewings,
  updateViewing,
} from '../controllers/viewingController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply authentication + property_manager role check to ALL routes
router.use(requireAuth, authorize('property_manager', 'admin'));

// Property Manager can view and manage viewing requests
router.get('/', getViewings);
router.get('/:id', getViewingById);
router.patch('/:id', updateViewing);
router.delete('/:id', deleteViewing);

export default router;
