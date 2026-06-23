import prisma from '../config/prisma.js';

export const getNotifications = async (req, res) => {
  try {
    const userNotifs = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.params.userId },
          { userId: 'all' }
        ]
      },
      orderBy: { id: 'desc' }
    });
    res.json(userNotifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const markNotificationsRead = async (req, res) => {
  const { userId } = req.body;
  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: userId },
          { userId: 'all' }
        ]
      },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};
