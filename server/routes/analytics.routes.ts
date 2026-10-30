import { Router } from 'express';
import { getSummary } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/summary', requireAuth, getSummary);

export default router;
