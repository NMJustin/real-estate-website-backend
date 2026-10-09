import { Router } from 'express';
import {
  createAdminProperty,
  deleteAdminProperty,
  getAdminProperties,
  getAdminProperty,
  updateAdminProperty,
} from '../controllers/adminPropertyController.js';
import { uploadPropertyMedia } from '../controllers/propertyMediaController.js';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAssignableAgents } from '../controllers/agentController.js';
import {
  assignPropertyManager,
  requireOwnedManagerProperty,
} from '../middleware/propertyManagerOwnership.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// Apply authentication + property_manager role check to ALL property manager routes
router.use(requireAuth, authorize('property_manager', 'admin'));

// Property managers can only access properties assigned to their account.
router.get('/agents', getAssignableAgents);
router.get('/', getAdminProperties);
router.get('/:id', requireOwnedManagerProperty, getAdminProperty);
router.post('/', assignPropertyManager, createAdminProperty);
router.patch('/:id', requireOwnedManagerProperty, assignPropertyManager, updateAdminProperty);
router.delete('/:id', requireOwnedManagerProperty, deleteAdminProperty);

router.post('/media', upload.single('file'), uploadPropertyMedia);

export default router;
