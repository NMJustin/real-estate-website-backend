import { Router } from 'express';
import {
  getAboutSection,
  getFeaturedSection,
  getHeroSection,
  getHomepageContent,
  getServicesSection,
  updateAboutSection,
  updateFeaturedSection,
  updateHeroSection,
  updateHomepageContent,
  updateServicesSection,
} from '../controllers/homepageContentController.js';

const router = Router();

router.get('/', getHomepageContent);
router.put('/', updateHomepageContent);
router.patch('/', updateHomepageContent);

router.get('/hero', getHeroSection);
router.put('/hero', updateHeroSection);
router.patch('/hero', updateHeroSection);

router.get('/about', getAboutSection);
router.put('/about', updateAboutSection);
router.patch('/about', updateAboutSection);

router.get('/services', getServicesSection);
router.put('/services', updateServicesSection);
router.patch('/services', updateServicesSection);

router.get('/featured', getFeaturedSection);
router.put('/featured', updateFeaturedSection);
router.patch('/featured', updateFeaturedSection);

export default router;
