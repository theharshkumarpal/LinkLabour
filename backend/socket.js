import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
        : process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT'],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
    }

    socket.on('join-chat', (jobId) => {
      socket.join(`job_${jobId}`);
      console.log(`Socket ${socket.id} joined chat room: job_${jobId}`);
    });

    socket.on('leave-chat', (jobId) => {
      socket.leave(`job_${jobId}`);
      console.log(`Socket ${socket.id} left chat room: job_${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

export const emitMessage = (jobId, message) => {
  if (io) {
    // Broadcast to job room and individual user rooms in a single chained call
    // so Socket.io automatically deduplicates the delivery to any socket in multiple rooms.
    io.to(`job_${jobId}`)
      .to(`user_${message.receiverId}`)
      .to(`user_${message.senderId}`)
      .emit('message', message);
  }
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
    if (userId === 'all') {
      io.emit('notification', notification);
    }
  }
};
