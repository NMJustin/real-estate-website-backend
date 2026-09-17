import { Router } from 'express';
import {
  createAgent,
  deleteAgent,
  getAgents,
  replaceAgent,
  updateAgent,
} from '../controllers/agentController.js';

const router = Router();

router.get('/', getAgents);
router.post('/', createAgent);
router.put('/:id', replaceAgent);
router.patch('/:id', updateAgent);
router.delete('/:id', deleteAgent);

export default router;
