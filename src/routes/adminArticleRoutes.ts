import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  replaceArticle,
  updateArticle,
} from '../controllers/articleController.js';

const router = Router();

router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/', createArticle);
router.put('/:id', replaceArticle);
router.patch('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
