import { Router } from 'express';
import { analyzeAsset, chat, synthesizeReport, getSessions, getSessionMessages } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/analyze-asset', requireAuth, analyzeAsset);
router.post('/chat', requireAuth, chat);
router.post('/synthesize-report', requireAuth, synthesizeReport);
router.get('/sessions', requireAuth, getSessions);
router.get('/sessions/:sessionId/messages', requireAuth, getSessionMessages);

export default router;
