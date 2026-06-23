import express from 'express';
import { getReviewsByWorker, getAllReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:workerId', getReviewsByWorker);
router.get('/', getAllReviews);

export default router;
