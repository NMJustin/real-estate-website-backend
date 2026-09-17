import { Router } from 'express';
import { getViewings } from '../controllers/viewingController.js';

const router = Router();

router.get('/', getViewings);

export default router;
