import prisma from '../config/prisma.js';

export const getReviewsByWorker = async (req, res) => {
  try {
    const workerReviews = await prisma.review.findMany({
      where: {
        job: {
          workerId: req.params.workerId
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(workerReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};
