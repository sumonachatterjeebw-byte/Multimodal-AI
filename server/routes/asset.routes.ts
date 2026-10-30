import { Router } from 'express';
import { uploadAsset, listAssets, getAssetById, deleteAsset } from '../controllers/asset.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/upload', requireAuth, uploadMiddleware.single('file'), uploadAsset);
router.get('/', requireAuth, listAssets);
router.get('/:id', requireAuth, getAssetById);
router.delete('/:id', requireAuth, deleteAsset);

export default router;
