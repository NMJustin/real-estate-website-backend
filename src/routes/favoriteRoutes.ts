import { Router } from 'express';
import {
  createFavorite,
  deleteFavorite,
  getFavoriteById,
  getFavorites,
  replaceFavorite,
  updateFavorite,
} from '../controllers/favoriteController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all favorite routes
router.use(requireAuth);

router.get('/', getFavorites);
router.post('/', createFavorite);
router.get('/:id', getFavoriteById);
router.put('/:id', replaceFavorite);
router.patch('/:id', updateFavorite);
router.delete('/:id', deleteFavorite);

export default router;
