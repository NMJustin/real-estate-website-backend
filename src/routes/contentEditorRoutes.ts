import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticles,
  replaceArticle,
  updateArticle,
} from '../controllers/articleController.js';
import {
  createFaq,
  deleteFaq,
  getManagedFaqs,
  replaceFaq,
  updateFaq,
} from '../controllers/faqController.js';
import {
  createPage,
  deletePage,
  getPageById,
  getPages,
  replacePage,
  updatePage,
} from '../controllers/pageController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply authentication + content_editor role check to ALL routes
router.use(requireAuth, authorize('content_editor', 'admin'));

// Content Editor can manage articles
router.get('/articles', getArticles);
router.get('/articles/:id', getArticles);
router.post('/articles', createArticle);
router.put('/articles/:id', replaceArticle);
router.patch('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);

// Content Editor can manage FAQs
router.get('/faqs', getManagedFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', replaceFaq);
router.patch('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

// Content Editor can manage pages
router.get('/pages', getPages);
router.get('/pages/:id', getPageById);
router.post('/pages', createPage);
router.put('/pages/:id', replacePage);
router.patch('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

export default router;
