import { Router } from 'express';
import {
  deleteContactMessage,
  getContactMessageById,
  getContactMessages,
  replaceContactMessage,
  replyToContactMessage,
  updateContactMessage,
} from '../controllers/contactController.js';

const router = Router();

router.get('/', getContactMessages);
router.get('/:id', getContactMessageById);
router.post('/:id/reply', replyToContactMessage);
router.put('/:id', replaceContactMessage);
router.patch('/:id', updateContactMessage);
router.delete('/:id', deleteContactMessage);

export default router;
