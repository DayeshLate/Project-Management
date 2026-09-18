"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.getComments = void 0;
const db_1 = __importDefault(require("../config/db"));
const task_validation_1 = require("../validations/task.validation");
const socket_1 = require("../sockets/socket");
const getComments = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const comments = await db_1.default.comment.findMany({
            where: { taskId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json({ success: true, data: comments });
    }
    catch (error) {
        next(error);
    }
};
exports.getComments = getComments;
const addComment = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;
        const { content } = task_validation_1.createCommentSchema.parse(req.body);
        const task = await db_1.default.task.findUnique({
            where: { id: taskId },
            select: { projectId: true },
        });
        if (!task) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        const comment = await db_1.default.comment.create({
            data: {
                taskId,
                userId,
                content,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
            },
        });
        // Record activity
        await db_1.default.activityLog.create({
            data: {
                taskId,
                userId,
                action: 'COMMENTED',
                details: JSON.stringify({ commentId: comment.id }),
            },
        });
        (0, socket_1.emitToProject)(task.projectId, 'comment_added', { taskId, comment });
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        next(error);
    }
};
exports.addComment = addComment;
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const comment = await db_1.default.comment.findUnique({
            where: { id },
            include: { task: { select: { projectId: true } } },
        });
        if (!comment) {
            res.status(404).json({ success: false, error: 'Comment not found' });
            return;
        }
        if (comment.userId !== userId) {
            res.status(403).json({ success: false, error: 'Cannot delete another user\'s comment' });
            return;
        }
        await db_1.default.comment.delete({
            where: { id },
        });
        (0, socket_1.emitToProject)(comment.task.projectId, 'comment_deleted', { commentId: id, taskId: comment.taskId });
        res.status(200).json({ success: true, message: 'Comment deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteComment = deleteComment;
