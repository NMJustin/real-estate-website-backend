import { Router } from 'express';
import {
  deleteInquiry,
  getInquiryById,
  getInquiries,
  updateInquiry,
} from '../controllers/inquiryController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply authentication + property_manager role check to ALL routes
router.use(requireAuth, authorize('property_manager', 'admin'));

// Property Manager can view and manage inquiries
router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
