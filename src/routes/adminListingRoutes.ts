import { Router } from 'express';
import { getListings, updateListing } from '../controllers/listingController.js';

const router = Router();

router.get('/', getListings);
router.patch('/:id', updateListing);

export default router;
