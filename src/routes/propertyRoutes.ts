import { Router } from 'express';
import {
	getCommercialProperties,
	getForLeaseProperties,
	getForRentProperties,
	getForSaleProperties,
	getLandProperties,
	getNewDevelopmentProperties,
	getProperties,
	getPropertiesByCategory,
	getPropertyBySlug,
	getResidentialProperties,
} from '../controllers/propertyController.js';

const router = Router();

router.get('/', getProperties);
router.get('/for-sale', getForSaleProperties);
router.get('/for-rent', getForRentProperties);
router.get('/for-lease', getForLeaseProperties);
router.get('/residential', getResidentialProperties);
router.get('/commercial', getCommercialProperties);
router.get('/land', getLandProperties);
router.get('/new-developments', getNewDevelopmentProperties);
router.get('/category/:category', getPropertiesByCategory);
router.get('/:slug', getPropertyBySlug);

export default router;
