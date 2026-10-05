import { Router } from 'express';
import {
  createListing,
  deleteListing,
  approveListing,
  getListingById,
  getListings,
  rejectListing,
  replaceListing,
  updateListing,
} from '../controllers/listingController.js';

const router = Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.patch('/:id/approve', approveListing);
router.patch('/:id/reject', rejectListing);
router.post('/', createListing);
router.put('/:id', replaceListing);
router.patch('/:id', updateListing);
router.delete('/:id', deleteListing);

export default router;
