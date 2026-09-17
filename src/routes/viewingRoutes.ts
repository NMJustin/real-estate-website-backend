import { Router } from 'express';
import {
	createViewing,
	deleteViewing,
	getViewingById,
	updateViewing,
} from '../controllers/viewingController.js';

const router = Router();

router.post('/', createViewing);
router.get('/:id', getViewingById);
router.patch('/:id', updateViewing);
router.delete('/:id', deleteViewing);

export default router;
