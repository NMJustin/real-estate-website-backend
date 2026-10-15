import { Router } from 'express';
import { adminLogin, forgotPassword, getMe, login, logout, register, resetPassword, updateProfile, seedAdminUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);
router.post('/admin/login', adminLogin);

// Temporary endpoint to seed admin user - protected with a simple secret
// REMOVE THIS AFTER SEEDING IS COMPLETE
router.post('/seed-admin', seedAdminUser);

export default router;
