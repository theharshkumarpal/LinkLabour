import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- API Router Mounting ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Global Error Handling ---
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`LaborLink Express server running on port ${PORT}`);
});
