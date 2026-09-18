"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubtask = exports.updateSubtask = exports.addSubtask = exports.deleteTask = exports.moveTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const db_1 = __importDefault(require("../config/db"));
const task_validation_1 = require("../validations/task.validation");
const socket_1 = require("../sockets/socket");
const getTasks = async (req, res, next) => {
    try {
        const { projectId, status, priority, search, assigneeId } = req.query;
        if (!projectId || typeof projectId !== 'string') {
            res.status(400).json({ success: false, error: 'projectId is required' });
            return;
        }
        const whereClause = { projectId };
        if (status && typeof status === 'string') {
            whereClause.status = status;
        }
        if (priority && typeof priority === 'string') {
            whereClause.priority = priority;
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }
        if (assigneeId && typeof assigneeId === 'string') {
            whereClause.assignees = {
                some: { userId: assigneeId },
            };
        }
        const tasks = await db_1.default.task.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                subtasks: {
                    orderBy: { orderIndex: 'asc' },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
                _count: {
                    select: { comments: true, subtasks: true },
                },
            },
            orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        });
        res.status(200).json({ success: true, data: tasks });
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await db_1.default.task.findUnique({
            where: { id },
            include: {
                project: {
                    select: { id: true, name: true, key: true, workspaceId: true },
                },
                creator: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                subtasks: {
                    orderBy: { orderIndex: 'asc' },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                activities: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatarColor: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!task) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        res.status(200).json({ success: true, data: task });
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = task_validation_1.createTaskSchema.parse(req.body);
        // Get max task number in this project
        const lastTask = await db_1.default.task.findFirst({
            where: { projectId: data.projectId },
            orderBy: { taskNumber: 'desc' },
            select: { taskNumber: true },
        });
        const nextTaskNumber = (lastTask?.taskNumber || 0) + 1;
        // Get highest order index for this status
        const lastStatusTask = await db_1.default.task.findFirst({
            where: { projectId: data.projectId, status: data.status },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true },
        });
        const nextOrderIndex = (lastStatusTask?.orderIndex || 0) + 1000;
        const task = await db_1.default.task.create({
            data: {
                taskNumber: nextTaskNumber,
                title: data.title,
                description: data.description || '',
                status: data.status,
                priority: data.priority,
                orderIndex: nextOrderIndex,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                projectId: data.projectId,
                creatorId: userId,
                assignees: {
                    create: data.assigneeIds.map((uId) => ({ userId: uId })),
                },
                labels: {
                    create: data.labels.map((lId) => ({ labelId: lId })),
                },
                activities: {
                    create: {
                        userId,
                        action: 'CREATED_TASK',
                        details: JSON.stringify({ title: data.title, status: data.status }),
                    },
                },
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                subtasks: true,
                labels: {
                    include: { label: true },
                },
                _count: {
                    select: { comments: true, subtasks: true },
                },
            },
        });
        (0, socket_1.emitToProject)(data.projectId, 'task_created', task);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const data = task_validation_1.updateTaskSchema.parse(req.body);
        const currentTask = await db_1.default.task.findUnique({
            where: { id },
            include: { assignees: true, labels: true },
        });
        if (!currentTask) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        // Prepare update data
        const updatePayload = {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
            orderIndex: data.orderIndex,
        };
        if (data.assigneeIds) {
            updatePayload.assignees = {
                deleteMany: {},
                create: data.assigneeIds.map((uId) => ({ userId: uId })),
            };
        }
        if (data.labels) {
            updatePayload.labels = {
                deleteMany: {},
                create: data.labels.map((lId) => ({ labelId: lId })),
            };
        }
        const updatedTask = await db_1.default.task.update({
            where: { id },
            data: {
                ...updatePayload,
                activities: {
                    create: {
                        userId,
                        action: 'UPDATED_TASK',
                        details: JSON.stringify(data),
                    },
                },
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                subtasks: true,
                labels: {
                    include: { label: true },
                },
                _count: {
                    select: { comments: true, subtasks: true },
                },
            },
        });
        (0, socket_1.emitToProject)(currentTask.projectId, 'task_updated', updatedTask);
        res.status(200).json({ success: true, data: updatedTask });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const moveTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { status, orderIndex } = task_validation_1.moveTaskSchema.parse(req.body);
        const currentTask = await db_1.default.task.findUnique({
            where: { id },
        });
        if (!currentTask) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        const statusChanged = currentTask.status !== status;
        const task = await db_1.default.task.update({
            where: { id },
            data: {
                status,
                orderIndex,
                activities: statusChanged
                    ? {
                        create: {
                            userId,
                            action: 'MOVED_STATUS',
                            details: JSON.stringify({ from: currentTask.status, to: status }),
                        },
                    }
                    : undefined,
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatarColor: true },
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                subtasks: true,
                labels: {
                    include: { label: true },
                },
                _count: {
                    select: { comments: true, subtasks: true },
                },
            },
        });
        (0, socket_1.emitToProject)(currentTask.projectId, 'task_moved', {
            taskId: id,
            projectId: currentTask.projectId,
            fromStatus: currentTask.status,
            toStatus: status,
            orderIndex,
            task,
        });
        res.status(200).json({ success: true, data: task });
    }
    catch (error) {
        next(error);
    }
};
exports.moveTask = moveTask;
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await db_1.default.task.findUnique({
            where: { id },
            select: { id: true, projectId: true },
        });
        if (!task) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        await db_1.default.task.delete({
            where: { id },
        });
        (0, socket_1.emitToProject)(task.projectId, 'task_deleted', { taskId: id, projectId: task.projectId });
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
// --- Subtasks ---
const addSubtask = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        const { title } = task_validation_1.createSubtaskSchema.parse(req.body);
        const lastSubtask = await db_1.default.subtask.findFirst({
            where: { taskId },
            orderBy: { orderIndex: 'desc' },
        });
        const subtask = await db_1.default.subtask.create({
            data: {
                taskId,
                title,
                orderIndex: (lastSubtask?.orderIndex ?? -1) + 1,
            },
        });
        res.status(201).json({ success: true, data: subtask });
    }
    catch (error) {
        next(error);
    }
};
exports.addSubtask = addSubtask;
const updateSubtask = async (req, res, next) => {
    try {
        const { subtaskId } = req.params;
        const data = task_validation_1.updateSubtaskSchema.parse(req.body);
        const subtask = await db_1.default.subtask.update({
            where: { id: subtaskId },
            data,
        });
        res.status(200).json({ success: true, data: subtask });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubtask = updateSubtask;
const deleteSubtask = async (req, res, next) => {
    try {
        const { subtaskId } = req.params;
        await db_1.default.subtask.delete({
            where: { id: subtaskId },
        });
        res.status(200).json({ success: true, message: 'Subtask deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubtask = deleteSubtask;
