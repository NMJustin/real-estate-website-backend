import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createInquiry,
  deleteInquiry,
  getInquiryById,
  getInquiries,
  replaceInquiry,
  updateInquiry,
} from '../controllers/inquiryController.js';

const router = Router();

router.post('/', createInquiry);
router.get('/', requireAuth, authorize('admin'), getInquiries);
router.get('/:id', requireAuth, authorize('admin'), getInquiryById);
router.put('/:id', requireAuth, authorize('admin'), replaceInquiry);
router.patch('/:id', requireAuth, authorize('admin'), updateInquiry);
router.delete('/:id', requireAuth, authorize('admin'), deleteInquiry);

export default router;
