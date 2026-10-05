import { Router } from 'express';
import {
  createInquiry,
  deleteInquiry,
  getInquiryById,
  getInquiries,
  replaceInquiry,
  updateInquiry,
} from '../controllers/inquiryController.js';

const router = Router();

router.get('/', getInquiries);
router.post('/', createInquiry);
router.get('/:id', getInquiryById);
router.put('/:id', replaceInquiry);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
