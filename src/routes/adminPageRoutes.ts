import { Router } from 'express';
import {
  createPage,
  deletePage,
  getPageById,
  getPages,
  replacePage,
  updatePage,
} from '../controllers/pageController.js';

const router = Router();

router.get('/', getPages);
router.get('/:id', getPageById);
router.post('/', createPage);
router.put('/:id', replacePage);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);

export default router;
