"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = exports.createWorkspaceSchema = void 0;
const zod_1 = require("zod");
exports.createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Workspace name must be at least 2 characters'),
});
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Project name must be at least 2 characters'),
    key: zod_1.z.string().min(2).max(10).toUpperCase(),
    description: zod_1.z.string().optional(),
    colorTag: zod_1.z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
    workspaceId: zod_1.z.string().uuid(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional().nullable(),
    colorTag: zod_1.z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
});
