import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  trackPageView,
  trackPropertyView,
  trackClickEvent,
} from '../controllers/analyticsController.js';
import {
  getAnalyticsSummary,
  getDeviceBreakdown,
  getTrafficSources,
  exportAnalyticsCsv,
  getPropertyAnalytics,
  getConversionFunnel,
} from '../controllers/analyticsDashboardController.js';

const router = Router();

// Public endpoints for tracking (no auth required)
router.post('/page-view', trackPageView);
router.post('/property-view', trackPropertyView);
router.post('/click-event', trackClickEvent);

// Admin analytics endpoints (auth required)
router.get('/summary', requireAuth, authorize('admin'), getAnalyticsSummary);
router.get('/devices', requireAuth, authorize('admin'), getDeviceBreakdown);
router.get('/sources', requireAuth, authorize('admin'), getTrafficSources);
router.get('/export/csv', requireAuth, authorize('admin'), exportAnalyticsCsv);
router.get('/property/:propertyId', requireAuth, authorize('admin'), getPropertyAnalytics);
router.get('/funnel', requireAuth, authorize('admin'), getConversionFunnel);

export default router;
