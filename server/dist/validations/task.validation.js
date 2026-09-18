"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubtaskSchema = exports.createSubtaskSchema = exports.createCommentSchema = exports.moveTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Task title is required').max(200),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    projectId: zod_1.z.string().uuid(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional().default([]),
    labels: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    orderIndex: zod_1.z.number().optional(),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.moveTaskSchema = zod_1.z.object({
    status: zod_1.z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
    orderIndex: zod_1.z.number(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment cannot be empty'),
});
exports.createSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Subtask title is required'),
});
exports.updateSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    isCompleted: zod_1.z.boolean().optional(),
});
