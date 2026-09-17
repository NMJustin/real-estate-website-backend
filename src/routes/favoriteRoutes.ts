import { Router } from 'express';
import { createFavorite, deleteFavorite, getFavorites } from '../controllers/favoriteController.js';

const router = Router();

router.get('/', getFavorites);
router.post('/', createFavorite);
router.delete('/:id', deleteFavorite);

export default router;
