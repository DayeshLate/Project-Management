"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const db_1 = __importDefault(require("../config/db"));
const project_validation_1 = require("../validations/project.validation");
const getProjects = async (req, res, next) => {
    try {
        const { workspaceId } = req.query;
        const userId = req.user.id;
        if (!workspaceId || typeof workspaceId !== 'string') {
            res.status(400).json({ success: false, error: 'workspaceId query parameter is required' });
            return;
        }
        // Verify workspace membership
        const membership = await db_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!membership) {
            res.status(403).json({ success: false, error: 'Access denied to this workspace' });
            return;
        }
        const projects = await db_1.default.project.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { tasks: true, members: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: projects });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const project = await db_1.default.project.findUnique({
            where: { id },
            include: {
                workspace: {
                    select: { id: true, name: true, slug: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                labels: true,
                _count: {
                    select: { tasks: true },
                },
            },
        });
        if (!project) {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        // Check workspace membership
        const membership = await db_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId,
                },
            },
        });
        if (!membership) {
            res.status(403).json({ success: false, error: 'Access denied to this project' });
            return;
        }
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = project_validation_1.createProjectSchema.parse(req.body);
        // Verify workspace membership
        const membership = await db_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: data.workspaceId,
                    userId,
                },
            },
        });
        if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MANAGER')) {
            res.status(403).json({ success: false, error: 'Only admins and managers can create projects' });
            return;
        }
        // Check if key is unique in workspace
        const existingKey = await db_1.default.project.findFirst({
            where: {
                workspaceId: data.workspaceId,
                key: data.key,
            },
        });
        if (existingKey) {
            res.status(400).json({ success: false, error: `Project key '${data.key}' is already in use in this workspace` });
            return;
        }
        const project = await db_1.default.project.create({
            data: {
                name: data.name,
                key: data.key,
                description: data.description || '',
                colorTag: data.colorTag || '#3B82F6',
                workspaceId: data.workspaceId,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                members: {
                    create: {
                        userId,
                        role: 'MANAGER',
                    },
                },
                labels: {
                    createMany: {
                        data: [
                            { name: 'Bug', color: '#EF4444' },
                            { name: 'Feature', color: '#3B82F6' },
                            { name: 'Enhancement', color: '#10B981' },
                            { name: 'Documentation', color: '#F59E0B' },
                        ],
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true },
                        },
                    },
                },
                labels: true,
            },
        });
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = project_validation_1.updateProjectSchema.parse(req.body);
        const project = await db_1.default.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                colorTag: data.colorTag,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db_1.default.project.delete({
            where: { id },
        });
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
