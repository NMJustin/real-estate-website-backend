import { Router } from 'express';
import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAgents,
  replaceAgent,
  updateAgent,
} from '../controllers/agentController.js';

const router = Router();

router.get('/', getAgents);
router.get('/:id', getAgentById);
router.post('/', createAgent);
router.put('/:id', replaceAgent);
router.patch('/:id', updateAgent);
router.delete('/:id', deleteAgent);

export default router;
