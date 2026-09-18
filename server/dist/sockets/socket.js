"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToProject = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.ENV.CORS_ORIGIN,
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);
        socket.on('join_project', (projectId) => {
            socket.join(`project:${projectId}`);
            console.log(`[Socket.io] Socket ${socket.id} joined room: project:${projectId}`);
        });
        socket.on('leave_project', (projectId) => {
            socket.leave(`project:${projectId}`);
            console.log(`[Socket.io] Socket ${socket.id} left room: project:${projectId}`);
        });
        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
const emitToProject = (projectId, event, data) => {
    if (io) {
        io.to(`project:${projectId}`).emit(event, data);
    }
};
exports.emitToProject = emitToProject;
