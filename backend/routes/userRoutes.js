import express from 'express';
import { getWorkers, getUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/workers', getWorkers);
router.get('/:id', getUser);

export default router;
