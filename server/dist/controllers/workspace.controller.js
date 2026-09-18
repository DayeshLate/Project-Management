"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceById = exports.createWorkspace = exports.getMyWorkspaces = void 0;
const db_1 = __importDefault(require("../config/db"));
const project_validation_1 = require("../validations/project.validation");
const getMyWorkspaces = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const memberships = await db_1.default.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        projects: {
                            select: { id: true, name: true, key: true, colorTag: true },
                        },
                        _count: {
                            select: { members: true, projects: true },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
        const workspaces = memberships.map((m) => ({
            ...m.workspace,
            userRole: m.role,
        }));
        res.status(200).json({ success: true, data: workspaces });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyWorkspaces = getMyWorkspaces;
const createWorkspace = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name } = project_validation_1.createWorkspaceSchema.parse(req.body);
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
        const workspace = await db_1.default.workspace.create({
            data: {
                name,
                slug,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
            include: {
                members: true,
            },
        });
        res.status(201).json({ success: true, data: workspace });
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkspace = createWorkspace;
const getWorkspaceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const workspace = await db_1.default.workspace.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarColor: true, bio: true },
                        },
                    },
                },
                projects: {
                    include: {
                        _count: {
                            select: { tasks: true, members: true },
                        },
                    },
                },
            },
        });
        if (!workspace) {
            res.status(404).json({ success: false, error: 'Workspace not found' });
            return;
        }
        const isMember = workspace.members.some((m) => m.userId === userId);
        if (!isMember) {
            res.status(403).json({ success: false, error: 'Access denied' });
            return;
        }
        res.status(200).json({ success: true, data: workspace });
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkspaceById = getWorkspaceById;
