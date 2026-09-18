import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { initSocket } from './sockets/socket';
import prisma from './config/db';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Test database connection and start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL database via Prisma');

    server.listen(ENV.PORT, () => {
      console.log(`🚀 Project Management Server running on port ${ENV.PORT}`);
      console.log(`📡 WebSocket server ready`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
