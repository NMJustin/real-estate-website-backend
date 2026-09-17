import { Router } from 'express';
import { createListing, getListingById, updateListing } from '../controllers/listingController.js';

const router = Router();

router.post('/', createListing);
router.get('/:id', getListingById);
router.patch('/:id', updateListing);

export default router;
