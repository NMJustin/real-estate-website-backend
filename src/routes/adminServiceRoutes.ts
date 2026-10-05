import { Router } from 'express';
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  getServices,
  replaceService,
  updateService,
} from '../controllers/serviceController.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', replaceService);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
