import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ENV } from '../config/env';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ENV.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room: project:${projectId}`);
    });

    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`[Socket.io] Socket ${socket.id} left room: project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const emitToProject = (projectId: string, event: string, data: any): void => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};
