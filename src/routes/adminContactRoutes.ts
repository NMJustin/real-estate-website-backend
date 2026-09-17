import { Router } from 'express';
import { deleteContactMessage, getContactMessages, updateContactMessage } from '../controllers/contactController.js';

const router = Router();

router.get('/', getContactMessages);
router.patch('/:id', updateContactMessage);
router.delete('/:id', deleteContactMessage);

export default router;
