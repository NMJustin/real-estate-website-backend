import { Router } from 'express';
import {
  createPropertyImage,
  deletePropertyImage,
  getPropertyImageById,
  getPropertyImages,
  replacePropertyImage,
  setPrimaryImage,
  updatePropertyImage,
} from '../controllers/propertyImageController.js';

const router = Router();

router.get('/', getPropertyImages);
router.get('/:id', getPropertyImageById);
router.post('/', createPropertyImage);
router.put('/:id', replacePropertyImage);
router.patch('/:id', updatePropertyImage);
router.patch('/:id/set-primary', setPrimaryImage);
router.delete('/:id', deletePropertyImage);

export default router;
