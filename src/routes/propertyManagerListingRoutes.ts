import { Router } from 'express';
import { getManagedListingRequests } from '../controllers/propertyManagerController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(requireAuth, authorize('property_manager', 'admin'));
router.get('/', getManagedListingRequests);

export default router;
