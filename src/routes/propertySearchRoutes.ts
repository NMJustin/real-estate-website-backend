import { Router } from 'express';
import {
  createPropertySearch,
  deletePropertySearch,
  getPropertySearchById,
  getPropertySearches,
  replacePropertySearch,
  updatePropertySearch,
} from '../controllers/propertySearchController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all property search routes
router.use(requireAuth);

router.get('/', getPropertySearches);
router.post('/', createPropertySearch);
router.get('/:id', getPropertySearchById);
router.put('/:id', replacePropertySearch);
router.patch('/:id', updatePropertySearch);
router.delete('/:id', deletePropertySearch);

export default router;