import { Router } from 'express';
import {
  createAdminProperty,
  getAdminProperties,
  getAdminProperty,
  updateAdminProperty,
} from '../controllers/adminPropertyController.js';
import { uploadPropertyMedia } from '../controllers/propertyMediaController.js';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// Apply authentication + property_manager role check to ALL property manager routes
router.use(requireAuth, authorize('property_manager', 'admin', 'agent'));

// Property Manager and Agents can create, view, and update properties
router.get('/', getAdminProperties);
router.get('/:id', getAdminProperty);
router.post('/', createAdminProperty);
router.patch('/:id', updateAdminProperty);

// Property Manager can upload property images (also accessible by agents and property owners)
router.post('/media', authorize('agent', 'property_owner'), upload.single('file'), uploadPropertyMedia);

export default router;
