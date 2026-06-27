import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userId: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  // Socket server URL — falls back to localhost in development
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050';
  socket = io(SOCKET_URL, {
    query: { userId },
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.io server as user:', userId);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const joinChat = (jobId: string) => {
  if (socket) {
    socket.emit('join-chat', jobId);
  }
};

export const leaveChat = (jobId: string) => {
  if (socket) {
    socket.emit('leave-chat', jobId);
  }
};
