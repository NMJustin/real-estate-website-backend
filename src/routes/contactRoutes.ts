import { Router } from 'express';
import {
  createContactMessage,
  deleteContactMessage,
  getContactMessageById,
  getContactMessages,
  replaceContactMessage,
  updateContactMessage,
} from '../controllers/contactController.js';

const router = Router();

router.get('/', getContactMessages);
router.post('/', createContactMessage);
router.get('/:id', getContactMessageById);
router.put('/:id', replaceContactMessage);
router.patch('/:id', updateContactMessage);
router.delete('/:id', deleteContactMessage);

export default router;
