import { Router } from 'express';
import {
  createAdminProperty,
  deleteAdminProperty,
  getAdminProperties,
  getAdminProperty,
  replaceAdminProperty,
  updateAdminProperty,
} from '../controllers/adminPropertyController.js';

const router = Router();

router.get('/', getAdminProperties);
router.post('/', createAdminProperty);
router.get('/:id', getAdminProperty);
router.put('/:id', replaceAdminProperty);
router.patch('/:id', updateAdminProperty);
router.delete('/:id', deleteAdminProperty);

export default router;
