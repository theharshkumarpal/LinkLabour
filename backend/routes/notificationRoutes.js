import express from 'express';
import { getNotifications, markNotificationsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:userId', authMiddleware, getNotifications);
router.post('/read', authMiddleware, markNotificationsRead);

export default router;
