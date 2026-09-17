import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticles,
  replaceArticle,
  updateArticle,
} from '../controllers/articleController.js';

const router = Router();

router.get('/', getArticles);
router.post('/', createArticle);
router.put('/:id', replaceArticle);
router.patch('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
