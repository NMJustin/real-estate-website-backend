import { Router } from 'express';
import { createPropertySearch } from '../controllers/propertySearchController.js';

const router = Router();

router.post('/', createPropertySearch);

export default router;