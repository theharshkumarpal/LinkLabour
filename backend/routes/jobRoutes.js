import express from 'express';
import { getJobs, postJob, completeJob, releaseEscrow } from '../controllers/jobController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.post('/', authMiddleware, requireRole('poster'), postJob);
router.put('/:id/complete', authMiddleware, completeJob);
router.put('/:id/release-escrow', authMiddleware, requireRole('poster'), releaseEscrow);

export default router;
