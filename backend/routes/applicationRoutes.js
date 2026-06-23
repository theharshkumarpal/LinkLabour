import express from 'express';
import { getApplications, submitProposal, acceptProposal } from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', authMiddleware, requireRole('worker'), submitProposal);
router.post('/:id/accept', authMiddleware, requireRole('poster'), acceptProposal);

export default router;
