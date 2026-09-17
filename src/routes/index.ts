import { Router } from 'express';
import authRoutes from './authRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import agentRoutes from './agentRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import viewingRoutes from './viewingRoutes.js';
import valuationRoutes from './valuationRoutes.js';
import articleRoutes from './articleRoutes.js';
import faqRoutes from './faqRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import contactRoutes from './contactRoutes.js';
import adminRoutes from './adminRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import listingRoutes from './listingRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import pageRoutes from './pageRoutes.js';
import settingRoutes from './settingRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Nihohange Real Estate API is running' });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/categories', categoryRoutes);
router.use('/agents', agentRoutes);
router.use('/services', serviceRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/viewings', viewingRoutes);
router.use('/valuations', valuationRoutes);
router.use('/listings', listingRoutes);
router.use('/articles', articleRoutes);
router.use('/faqs', faqRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/contact', contactRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingRoutes);
router.use('/admin', adminRoutes);

export default router;
