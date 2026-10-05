import { Router } from 'express';
import {
  getFeaturedProperties,
  removePropertyFromFeatured,
  setPropertyAsFeatured,
  toggleFeaturedStatus,
} from '../controllers/featuredPropertyController.js';

const router = Router();

router.get('/', getFeaturedProperties);
router.post('/:id/feature', setPropertyAsFeatured);
router.delete('/:id/feature', removePropertyFromFeatured);
router.patch('/:id/toggle', toggleFeaturedStatus);

export default router;
