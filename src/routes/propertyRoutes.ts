import { Router } from 'express';
import {
  createProperty,
  deleteProperty,
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
  getPropertyById,
  getPropertyBySlug,
  getResidentialProperties,
  getWarehousesProperties,
  replaceProperty,
  updateProperty,
} from '../controllers/propertyController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Public GET routes
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
router.get('/id/:id', getPropertyById);
router.get('/:slug', getPropertyBySlug);

// Authenticated routes for property management
router.post('/', requireAuth, authorize('admin', 'property_manager', 'agent'), createProperty);
router.put('/:id', requireAuth, authorize('admin', 'property_manager', 'agent'), replaceProperty);
router.patch('/:id', requireAuth, authorize('admin', 'property_manager', 'agent'), updateProperty);
router.delete('/:id', requireAuth, authorize('admin', 'property_manager', 'agent'), deleteProperty);

export default router;
