import { Router } from 'express';
import { getAgentBySlug, getAgents } from '../controllers/agentController.js';

const router = Router();

router.get('/', getAgents);
router.get('/:slug', getAgentBySlug);

export default router;
