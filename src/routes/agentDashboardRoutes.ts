import { Router } from 'express';
import {
  getAgentProperties,
  getAgentProperty,
  updateAgentProperty,
} from '../controllers/agentPropertyController.js';
import {
  getAgentInquiry,
  getAgentInquiries,
  updateInquiryFollowUp,
  updateInquiryStatus,
} from '../controllers/agentInquiryController.js';
import {
  getAgentViewing,
  getAgentViewings,
  scheduleViewing,
  updateViewingStatus,
} from '../controllers/agentViewingController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Apply authentication + agent role check to ALL agent dashboard routes
router.use(requireAuth, authorize('agent', 'admin'));

// Agent can manage assigned properties
router.get('/my-properties', getAgentProperties);
router.get('/my-properties/:id', getAgentProperty);
router.patch('/my-properties/:id', updateAgentProperty);

// Agent can view and manage customer inquiries
router.get('/my-inquiries', getAgentInquiries);
router.get('/my-inquiries/:id', getAgentInquiry);
router.patch('/my-inquiries/:id/status', updateInquiryStatus);
router.patch('/my-inquiries/:id/follow-up', updateInquiryFollowUp);

// Agent can schedule and manage property viewings
router.get('/my-viewings', getAgentViewings);
router.get('/my-viewings/:id', getAgentViewing);
router.post('/my-viewings', scheduleViewing);
router.patch('/my-viewings/:id', updateViewingStatus);

export default router;
