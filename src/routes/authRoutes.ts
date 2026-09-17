import { Router } from 'express';
import { adminLogin, getMe, login, logout, register, updateProfile } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/profile', updateProfile);
router.post('/admin/login', adminLogin);

export default router;
