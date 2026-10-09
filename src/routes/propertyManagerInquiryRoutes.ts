import { Router } from 'express';
import {
  deleteInquiry,
  getInquiryById,
  updateInquiry,
} from '../controllers/inquiryController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  getManagedInquiries,
} from '../controllers/propertyManagerController.js';
import { requireOwnedManagerInquiry } from '../middleware/propertyManagerOwnership.js';

const router = Router();

// Apply authentication + property_manager role check to ALL routes
router.use(requireAuth, authorize('property_manager', 'admin'));

// Property Manager can view and manage inquiries
router.get('/', getManagedInquiries);
router.get('/:id', requireOwnedManagerInquiry, getInquiryById);
router.patch('/:id', requireOwnedManagerInquiry, updateInquiry);
router.delete('/:id', requireOwnedManagerInquiry, deleteInquiry);

export default router;
