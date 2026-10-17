import { Router } from 'express';
import {
  getAllDevelopments,
  getDevelopmentById,
  createDevelopment,
  updateDevelopment,
  deleteDevelopment,
} from '../controllers/developmentController.js';

const router = Router();

router.get('/', getAllDevelopments);
router.get('/:id', getDevelopmentById);
router.post('/', createDevelopment);
router.patch('/:id', updateDevelopment);
router.delete('/:id', deleteDevelopment);

export default router;
