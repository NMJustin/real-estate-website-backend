import { Router } from 'express';
import { createUser, getDashboard, getRoles, getUsers, updateUser, updateUserMediaPermission } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import adminPropertyRoutes from './adminPropertyRoutes.js';
import adminArticleRoutes from './adminArticleRoutes.js';
import adminFaqRoutes from './adminFaqRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import settingRoutes from './settingRoutes.js';
import adminCategoryRoutes from './adminCategoryRoutes.js';
import adminInquiryRoutes from './adminInquiryRoutes.js';
import adminViewingRoutes from './adminViewingRoutes.js';
import adminValuationRoutes from './adminValuationRoutes.js';
import adminListingRoutes from './adminListingRoutes.js';
import adminServiceRoutes from './adminServiceRoutes.js';
import adminContactRoutes from './adminContactRoutes.js';
import adminPageRoutes from './adminPageRoutes.js';
import adminPropertyImageRoutes from './adminPropertyImageRoutes.js';
import adminFeaturedPropertyRoutes from './adminFeaturedPropertyRoutes.js';
import adminHomepageContentRoutes from './adminHomepageContentRoutes.js';

const router = Router();

// Apply authentication + admin role check to ALL admin routes
router.use(requireAuth, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.get('/roles', getRoles);
router.patch('/users/:id/media-permission', updateUserMediaPermission);
router.use('/properties', adminPropertyRoutes);
router.use('/property-images', adminPropertyImageRoutes);
router.use('/featured-properties', adminFeaturedPropertyRoutes);
router.use('/categories', adminCategoryRoutes);
router.use('/inquiries', adminInquiryRoutes);
router.use('/viewings', adminViewingRoutes);
router.use('/valuations', adminValuationRoutes);
router.use('/listings', adminListingRoutes);
router.use('/articles', adminArticleRoutes);
router.use('/faqs', adminFaqRoutes);
router.use('/services', adminServiceRoutes);
router.use('/contact', adminContactRoutes);
router.use('/pages', adminPageRoutes);
router.use('/homepage', adminHomepageContentRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingRoutes);

export default router;
