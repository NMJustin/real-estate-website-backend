import { Router } from 'express';
import { getInquiries } from '../controllers/inquiryController.js';

const router = Router();

router.get('/', getInquiries);

export default router;
