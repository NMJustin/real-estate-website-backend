import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { createListing } from '../controllers/listingController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 8, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error('Only JPG, PNG, WebP, and GIF images are allowed.'));
      return;
    }
    callback(null, true);
  },
});
const parseListingImages: RequestHandler = (req, res, next) => {
  upload.array('images', 8)(req, res, (error?: unknown) => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unable to process uploaded property images.';
      return res.status(400).json({ success: false, message });
    }
    return next();
  });
};

router.post('/', parseListingImages, createListing);

export default router;
