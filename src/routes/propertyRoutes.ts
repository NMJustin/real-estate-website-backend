import { Router } from 'express';
import {
	getApartmentsProperties,
	getCommercialProperties,
	getForLeaseProperties,
	getForRentProperties,
	getForSaleProperties,
	getHousesProperties,
	getLandProperties,
	getNewDevelopmentProperties,
	getOfficesProperties,
	getProperties,
	getPropertiesByCategory,
	getPropertyBySlug,
	getResidentialProperties,
	getWarehousesProperties,
} from '../controllers/propertyController.js';

const router = Router();

router.get('/', getProperties);
router.get('/for-sale', getForSaleProperties);
router.get('/for-rent', getForRentProperties);
router.get('/for-lease', getForLeaseProperties);
router.get('/residential', getResidentialProperties);
router.get('/commercial', getCommercialProperties);
router.get('/apartments', getApartmentsProperties);
router.get('/houses', getHousesProperties);
router.get('/land', getLandProperties);
router.get('/offices', getOfficesProperties);
router.get('/warehouses', getWarehousesProperties);
router.get('/new-developments', getNewDevelopmentProperties);
router.get('/category/:category', getPropertiesByCategory);
router.get('/:slug', getPropertyBySlug);

export default router;
