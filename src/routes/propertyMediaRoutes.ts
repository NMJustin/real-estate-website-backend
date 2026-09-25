import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { uploadPropertyMedia } from '../controllers/propertyMediaController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('file'), uploadPropertyMedia);

export default router;
