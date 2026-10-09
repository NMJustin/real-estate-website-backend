import { Router } from 'express';
import {
  deleteViewing,
  getViewingById,
  updateViewing,
} from '../controllers/viewingController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { createManagedViewing, getManagedViewings } from '../controllers/propertyManagerController.js';
import { requireOwnedManagerViewing } from '../middleware/propertyManagerOwnership.js';

const router = Router();

// Apply authentication + property_manager role check to ALL routes
router.use(requireAuth, authorize('property_manager', 'admin'));

// Property Manager can view and manage viewing requests
router.get('/', getManagedViewings);
router.post('/', createManagedViewing);
router.get('/:id', requireOwnedManagerViewing, getViewingById);
router.patch('/:id', requireOwnedManagerViewing, updateViewing);
router.delete('/:id', requireOwnedManagerViewing, deleteViewing);

export default router;
