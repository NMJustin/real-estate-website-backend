import { Router } from 'express';
import { getAgentBySlug, getAgents } from '../controllers/agentController.js';

const router = Router();

// Public routes for displaying agents on the website
router.get('/', getAgents);
router.get('/:slug', getAgentBySlug);

export default router;
