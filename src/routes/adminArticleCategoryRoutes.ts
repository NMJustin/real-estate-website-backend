import { Router } from 'express';
import {
  createArticleCategory,
  deleteArticleCategory,
  getArticleCategoryById,
  getArticleCategories,
  replaceArticleCategory,
  updateArticleCategory,
} from '../controllers/articleCategoryController.js';

const router = Router();

router.get('/', getArticleCategories);
router.get('/:id', getArticleCategoryById);
router.post('/', createArticleCategory);
router.put('/:id', replaceArticleCategory);
router.patch('/:id', updateArticleCategory);
router.delete('/:id', deleteArticleCategory);

export default router;
