import prisma from '../config/prisma.js';
import { emitNotification } from '../socket.js';

export const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const submitProposal = async (req, res) => {
  const { jobId, jobTitle, workerId, workerName, workerAvatar, workerRating, bidAmount, message } = req.body;
  try {
    const newApp = await prisma.application.create({
      data: {
        id: `app-${Date.now()}`,
        jobId,
        jobTitle,
        workerId,
        workerName,
        workerAvatar,
        workerRating: Number(workerRating),
        workerCompletionRate: 100.0,
        bidAmount: Number(bidAmount),
        message: message || 'I am interested in completing this project.',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      }
    });

    // Find the job poster to notify them
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    if (job) {
      const notif = await prisma.notification.create({
        data: {
          id: `notif-${Date.now()}`,
          userId: job.posterId,
          text: `New proposal bid of $${bidAmount} received for your task "${jobTitle}".`,
          read: false,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
      emitNotification(job.posterId, notif);
    }

    res.json({ success: true, application: newApp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

export const acceptProposal = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: req.params.id }
      });

      if (!application) throw new Error('Application not found');
      const jobId = application.jobId;
      const bidAmount = application.bidAmount;

      const job = await tx.job.findUnique({
        where: { id: jobId }
      });
      if (!job) throw new Error('Job not found');

      const poster = await tx.user.findUnique({
        where: { id: job.posterId }
      });
      if (!poster || poster.balance < bidAmount) {
        throw new Error('Insufficient wallet balance.');
      }

      // Deduct balance from poster
      await tx.user.update({
        where: { id: job.posterId },
        data: { balance: { decrement: bidAmount } }
      });

      // Update Job status and worker assignment
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          status: 'in_progress',
          workerId: application.workerId,
          workerName: application.workerName,
          budget: bidAmount
        }
      });

      // Set this application as accepted and reject others
      await tx.application.updateMany({
        where: { jobId: jobId, id: { not: application.id } },
        data: { status: 'rejected' }
      });

      const acceptedApp = await tx.application.update({
        where: { id: application.id },
        data: { status: 'accepted' }
      });

      // Notify worker
      const notif = await tx.notification.create({
        data: {
          id: `notif-${Date.now()}`,
          userId: application.workerId,
          text: `Your proposal bid of $${bidAmount} for "${job.title}" has been ACCEPTED! Start working.`,
          read: false,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });

      return { application: acceptedApp, job: updatedJob, notification: notif };
    });

    if (result.notification) {
      emitNotification(result.notification.userId, result.notification);
    }

    res.json({ success: true, application: result.application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Database error' });
  }
};
