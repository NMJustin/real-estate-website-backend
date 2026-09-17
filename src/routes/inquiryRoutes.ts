import { Router } from 'express';
import {
	createInquiry,
	deleteInquiry,
	getInquiryById,
	updateInquiry,
} from '../controllers/inquiryController.js';

const router = Router();

router.post('/', createInquiry);
router.get('/:id', getInquiryById);
router.patch('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
