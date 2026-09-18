import { Router } from 'express';
import { getDashboard, getUsers } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import adminPropertyRoutes from './adminPropertyRoutes.js';
import adminArticleRoutes from './adminArticleRoutes.js';
import adminFaqRoutes from './adminFaqRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import settingRoutes from './settingRoutes.js';
import adminAgentRoutes from './adminAgentRoutes.js';
import adminCategoryRoutes from './adminCategoryRoutes.js';
import adminInquiryRoutes from './adminInquiryRoutes.js';
import adminViewingRoutes from './adminViewingRoutes.js';
import adminValuationRoutes from './adminValuationRoutes.js';
import adminListingRoutes from './adminListingRoutes.js';
import adminServiceRoutes from './adminServiceRoutes.js';
import adminContactRoutes from './adminContactRoutes.js';

const router = Router();

// Apply authentication + admin role check to ALL admin routes
router.use(requireAuth, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.use('/properties', adminPropertyRoutes);
router.use('/categories', adminCategoryRoutes);
router.use('/agents', adminAgentRoutes);
router.use('/inquiries', adminInquiryRoutes);
router.use('/viewings', adminViewingRoutes);
router.use('/valuations', adminValuationRoutes);
router.use('/listings', adminListingRoutes);
router.use('/articles', adminArticleRoutes);
router.use('/faqs', adminFaqRoutes);
router.use('/services', adminServiceRoutes);
router.use('/contact', adminContactRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingRoutes);

export default router;
