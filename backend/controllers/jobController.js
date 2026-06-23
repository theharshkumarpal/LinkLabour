import prisma from '../config/prisma.js';

export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const postJob = async (req, res) => {
  const { title, description, category, posterId, posterName, posterRating, budget, location, date, requirements, duration, latitude, longitude } = req.body;
  try {
    const newJob = await prisma.job.create({
      data: {
        id: `job-${Date.now()}`,
        title,
        description,
        category,
        posterId,
        posterName,
        posterRating: Number(posterRating),
        budget: Number(budget),
        location,
        date,
        status: 'open',
        requirements: requirements || [],
        duration: duration || '1 Day',
        createdDate: new Date().toISOString().split('T')[0],
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      }
    });
    res.json({ success: true, job: newJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

export const completeJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'completed' }
    });

    // Notify the poster
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}`,
        userId: job.posterId,
        text: `Technician completed "${job.title}". Awaiting your review and escrow payment release.`,
        read: false,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const releaseEscrow = async (req, res) => {
  const { rating, comment, reviewerName } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: req.params.id }
      });

      if (!job) throw new Error('Job not found');
      if (!job.workerId) throw new Error('No worker assigned to this job');

      const updatedJob = await tx.job.update({
        where: { id: req.params.id },
        data: { status: 'completed' }
      });

      // Create Review
      const newReview = await tx.review.create({
        data: {
          id: `rev-${Date.now()}`,
          jobId: job.id,
          rating: Number(rating),
          comment: comment || 'Professional and highly skilled worker.',
          reviewerName,
          reviewerRole: 'poster',
          date: new Date().toISOString().split('T')[0],
        }
      });

      // Recalculate average rating of worker reviews
      const workerJobs = await tx.job.findMany({
        where: { workerId: job.workerId },
        select: { id: true }
      });
      const jobIds = workerJobs.map(j => j.id);

      const workerReviews = await tx.review.findMany({
        where: { jobId: { in: jobIds } }
      });
      const avgRating = Number((workerReviews.reduce((acc, r) => acc + r.rating, 0) / (workerReviews.length || 1)).toFixed(1));

      // Update worker balance, completedJobs and rating
      const updatedWorker = await tx.user.update({
        where: { id: job.workerId },
        data: {
          balance: { increment: job.budget },
          completedJobs: { increment: 1 },
          rating: avgRating,
          reviewCount: { increment: 1 }
        }
      });

      // Notify worker
      await tx.notification.create({
        data: {
          id: `notif-${Date.now()}`,
          userId: job.workerId,
          text: `Payment of $${job.budget} released from Escrow to your wallet for "${job.title}".`,
          read: false,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });

      return { job: updatedJob, worker: updatedWorker, review: newReview };
    });

    res.json({ success: true, job: result.job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Database error' });
  }
};
