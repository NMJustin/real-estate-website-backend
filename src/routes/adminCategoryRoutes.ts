import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  replaceCategory,
  updateCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', replaceCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
