import { Router } from 'express';
import {
  createViewing,
  deleteViewing,
  getViewingById,
  getViewings,
  replaceViewing,
  updateViewing,
} from '../controllers/viewingController.js';

const router = Router();

router.get('/', getViewings);
router.post('/', createViewing);
router.get('/:id', getViewingById);
router.put('/:id', replaceViewing);
router.patch('/:id', updateViewing);
router.delete('/:id', deleteViewing);

export default router;
