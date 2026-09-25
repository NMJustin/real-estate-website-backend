import { Router } from 'express';
import multer from 'multer';
import {
  createAdminProperty,
  deleteAdminProperty,
  getAdminProperties,
  getAdminProperty,
  replaceAdminProperty,
  updateAdminProperty,
} from '../controllers/adminPropertyController.js';
import { uploadPropertyMedia } from '../controllers/propertyMediaController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post('/media', requireAuth, upload.single('file'), uploadPropertyMedia);
router.get('/', getAdminProperties);
router.post('/', createAdminProperty);
router.get('/:id', getAdminProperty);
router.put('/:id', replaceAdminProperty);
router.patch('/:id', updateAdminProperty);
router.delete('/:id', deleteAdminProperty);

export default router;
