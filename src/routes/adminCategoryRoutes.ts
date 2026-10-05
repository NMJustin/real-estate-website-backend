import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  replaceCategory,
  updateCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', replaceCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
