import prisma from '../config/prisma.js';

export const getWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'worker' }
    });
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};
