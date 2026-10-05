import { Router } from 'express';
import {
  deleteInquiry,
  getInquiryById,
  getInquiries,
  replaceInquiry,
  updateInquiry,
} from '../controllers/inquiryController.js';

const router = Router();

router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.put('/:id', replaceInquiry);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
