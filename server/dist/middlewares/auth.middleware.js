"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Authorization token required' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const user = (0, jwt_1.verifyToken)(token);
    if (!user) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
        return;
    }
    req.user = user;
    next();
};
exports.authenticate = authenticate;
