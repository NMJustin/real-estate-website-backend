import { Router } from 'express';
import {
  getArticleCategories,
  getArticleCategoryBySlug,
} from '../controllers/articleCategoryController.js';

const router = Router();

router.get('/', getArticleCategories);
router.get('/:slug', getArticleCategoryBySlug);

export default router;
