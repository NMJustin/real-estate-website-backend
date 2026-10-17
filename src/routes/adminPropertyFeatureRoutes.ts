import { Router } from 'express';
import {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
} from '../controllers/propertyFeatureController.js';

const router = Router();

router.get('/', getAllFeatures);
router.get('/:id', getFeatureById);
router.post('/', createFeature);
router.patch('/:id', updateFeature);
router.delete('/:id', deleteFeature);

export default router;
