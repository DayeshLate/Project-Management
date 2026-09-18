"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const socket_1 = require("./sockets/socket");
const db_1 = __importDefault(require("./config/db"));
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
(0, socket_1.initSocket)(server);
// Test database connection and start server
const startServer = async () => {
    try {
        await db_1.default.$connect();
        console.log('✅ Connected to MySQL database via Prisma');
        server.listen(env_1.ENV.PORT, () => {
            console.log(`🚀 Project Management Server running on port ${env_1.ENV.PORT}`);
            console.log(`📡 WebSocket server ready`);
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to database:', error);
        process.exit(1);
    }
};
startServer();
